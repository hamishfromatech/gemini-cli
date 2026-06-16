/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import type { PolicyEngine } from '../policy/policy-engine.js';
import { ApprovalMode, PolicyDecision } from '../policy/types.js';
import { MessageBusType, type Message } from './types.js';
import { safeJsonStringify } from '../utils/safeJsonStringify.js';
import { debugLogger } from '../utils/debugLogger.js';
import type { Config } from '../config/config.js';
import {
  AutoModeClassifier,
  isAutoModeFastPath,
  type AutoModeContext,
  type AutoModeUserTurn,
} from '../safety/autoModeClassifier.js';

export class MessageBus extends EventEmitter {
  private listenerToAbortCleanup = new WeakMap<
    object,
    Map<string, () => void>
  >();

  /**
   * Per-session counters for the auto mode backstop. Keyed by subagent
   * scope so subagent activity can't blow past the parent session's
   * denial budget.
   */
  private readonly autoModeDenialCounters = new Map<
    string,
    { consecutive: number; total: number }
  >();

  constructor(
    private readonly policyEngine: PolicyEngine,
    private readonly debug = false,
    private readonly isTrusted = true,
    private readonly config?: Config,
  ) {
    super();
  }

  private isValidMessage(message: Message): boolean {
    if (!message || !message.type) {
      return false;
    }

    if (
      message.type === MessageBusType.TOOL_CONFIRMATION_REQUEST &&
      !('correlationId' in message)
    ) {
      return false;
    }

    return true;
  }

  private emitMessage(message: Message): void {
    this.emit(message.type, message);
  }

  /**
   * Derives a child message bus scoped to a specific subagent.
   * Derived buses are untrusted.
   */
  derive(subagentName: string): MessageBus {
    const bus = new MessageBus(this.policyEngine, this.debug, false, this.config);

    bus.publish = async (message: Message) => {
      if (message.type === MessageBusType.TOOL_CONFIRMATION_REQUEST) {
        // Sanitization for untrusted callers:
        // 1. Remove forcedDecision to prevent policy bypass.
        // 2. Remove metadata (serverName, toolAnnotations, details) to prevent spoofing.
        // 3. Enforce subagent identity by prepending/setting the scope.
        const {
          forcedDecision: _forcedDecision,
          subagent: _subagent,
          serverName: _serverName,
          toolAnnotations: _toolAnnotations,
          details: _details,
          ...otherFields
        } = message;

        return this.publish({
          ...otherFields,
          subagent: message.subagent
            ? `${subagentName}/${message.subagent}`
            : subagentName,
        } as Message);
      }
      return this.publish(message);
    };

    // Delegate subscription methods to the parent bus
    bus.subscribe = this.subscribe.bind(this);
    bus.unsubscribe = this.unsubscribe.bind(this);
    bus.on = this.on.bind(this);
    bus.off = this.off.bind(this);
    bus.emit = this.emit.bind(this);
    bus.once = this.once.bind(this);
    bus.removeListener = this.removeListener.bind(this);
    bus.listenerCount = this.listenerCount.bind(this);

    return bus;
  }

  async publish(message: Message): Promise<void> {
    if (this.debug) {
      debugLogger.debug(`[MESSAGE_BUS] publish: ${safeJsonStringify(message)}`);
    }
    try {
      if (!this.isValidMessage(message)) {
        throw new Error(
          `Invalid message structure: ${safeJsonStringify(message)}`,
        );
      }

      if (message.type === MessageBusType.TOOL_CONFIRMATION_REQUEST) {
        const { decision: policyDecision } = await this.policyEngine.check(
          message.toolCall,
          message.serverName,
          message.toolAnnotations,
          message.subagent,
        );

        // Only trust forcedDecision if it comes from a trusted bus
        const decision =
          (this.isTrusted ? message.forcedDecision : undefined) ??
          policyDecision;

        switch (decision) {
          case PolicyDecision.ALLOW:
            this.recordAutoModeDecision(message.subagent, 'allow');
            // Directly emit the response instead of recursive publish
            this.emitMessage({
              type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
              correlationId: message.correlationId,
              confirmed: true,
            });
            break;
          case PolicyDecision.DENY:
            this.recordAutoModeDecision(message.subagent, 'deny');
            // Emit both rejection and response messages
            this.emitMessage({
              type: MessageBusType.TOOL_POLICY_REJECTION,
              toolCall: message.toolCall,
            });
            this.emitMessage({
              type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
              correlationId: message.correlationId,
              confirmed: false,
            });
            break;
          case PolicyDecision.ASK_USER:
            // Auto mode: instead of prompting the user, route through the
            // model-based classifier. Cheap tiers (built-in safe tools,
            // in-project writes) bypass the classifier entirely.
            if (
              this.policyEngine.getApprovalMode() === ApprovalMode.AUTO &&
              this.isTrusted
            ) {
              await this.handleAutoMode(message);
              break;
            }
            // Pass through to UI for user confirmation if any listeners exist.
            // If no listeners are registered (e.g., headless/ACP flows),
            // immediately request user confirmation to avoid long timeouts.
            if (
              this.listenerCount(MessageBusType.TOOL_CONFIRMATION_REQUEST) > 0
            ) {
              this.emitMessage(message);
            } else {
              this.emitMessage({
                type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
                correlationId: message.correlationId,
                confirmed: false,
                requiresUserConfirmation: true,
              });
            }
            break;
          default:
            throw new Error(`Unknown policy decision: ${decision}`);
        }
      } else {
        // For all other message types, just emit them
        this.emitMessage(message);
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * Run the auto mode pipeline for a single tool call. The pipeline is
   * deliberately layered:
   *
   *   Tier 1: Built-in safe tools and in-project file writes — no
   *           classifier call, no latency.
   *   Tier 2: The two-stage LLM classifier — fast filter, then reasoned
   *           re-evaluation only when the fast filter flags the action.
   *   Tier 3: Backstop — terminate after too many denials in a row.
   *
   * The classifier only sees user messages and tool call payloads; it
   * does not see assistant text, tool descriptions, or tool outputs.
   */
  private async handleAutoMode(
    message: Extract<Message, { type: MessageBusType.TOOL_CONFIRMATION_REQUEST }>,
  ): Promise<void> {
    if (!this.config) {
      // No config available — degrade to the default ASK_USER flow.
      this.emitMessage(message);
      return;
    }

    const workspaceDir = this.config.getProjectRoot();
    const toolArgs = message.toolCall.args ?? {};

    // Tier 1: cheap synchronous bypass for safe tools and in-project writes.
    if (isAutoModeFastPath(message.toolCall.name, toolArgs, workspaceDir)) {
      debugLogger.debug(
        `[MessageBus] auto-mode fast-path allow: ${message.toolCall.name}`,
      );
      this.recordAutoModeDecision(message.subagent, 'allow');
      this.emitMessage({
        type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
        correlationId: message.correlationId,
        confirmed: true,
      });
      return;
    }

    // Tier 3 backstop: too many denials means the agent is stuck in a
    // loop. Escalate to the user instead of guessing.
    const counters = this.getAutoModeCounters(message.subagent);
    if (counters.consecutive >= AutoModeClassifier.MAX_CONSECUTIVE_DENIALS) {
      debugLogger.warn(
        `[MessageBus] auto-mode backstop: ${counters.consecutive} consecutive denials, escalating to user.`,
      );
      this.fallbackToAskUser(message);
      return;
    }
    if (counters.total >= AutoModeClassifier.MAX_TOTAL_DENIALS) {
      debugLogger.warn(
        `[MessageBus] auto-mode backstop: ${counters.total} total denials, escalating to user.`,
      );
      this.fallbackToAskUser(message);
      return;
    }

    // Tier 2: two-stage classifier.
    let decision: 'allow' | 'deny' | 'abstain';
    try {
      const client = this.config.getBaseLlmClient();
      const classifier = new AutoModeClassifier({
        client,
        config: this.config,
        modelConfigKey: { model: this.config.getActiveModel() },
      });
      decision = await classifier.classify(this.buildAutoModeContext(message));
    } catch (err) {
      // Classifier unavailable — fall through to the user. We prefer
      // a moment of friction over guessing.
      debugLogger.warn(
        `[MessageBus] auto-mode classifier unavailable, falling back to ASK_USER: ${err instanceof Error ? err.message : String(err)}`,
      );
      this.fallbackToAskUser(message);
      return;
    }

    switch (decision) {
      case 'allow':
        this.recordAutoModeDecision(message.subagent, 'allow');
        this.emitMessage({
          type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
          correlationId: message.correlationId,
          confirmed: true,
        });
        break;
      case 'deny':
        this.recordAutoModeDecision(message.subagent, 'deny');
        this.emitMessage({
          type: MessageBusType.TOOL_POLICY_REJECTION,
          toolCall: message.toolCall,
        });
        this.emitMessage({
          type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
          correlationId: message.correlationId,
          confirmed: false,
        });
        break;
      case 'abstain':
      default:
        this.fallbackToAskUser(message);
        break;
    }
  }

  /**
   * Build the reasoning-blind classifier context. We extract only user
   * turns from the chat history (no assistant text, no tool results).
   */
  private buildAutoModeContext(
    message: Extract<Message, { type: MessageBusType.TOOL_CONFIRMATION_REQUEST }>,
  ): AutoModeContext {
    const userTurns: AutoModeUserTurn[] = [];
    try {
      const history = this.config!.getUserContentHistory();
      for (const content of history) {
        if (content?.role !== 'user') continue;
        const parts = content.parts ?? [];
        for (const part of parts) {
          if (typeof part?.text === 'string' && part.text.trim()) {
            userTurns.push({ text: part.text });
          }
        }
      }
      // Cap to the most recent 6 user turns — older turns are unlikely
      // to still represent the user's current intent.
      if (userTurns.length > 6) {
        userTurns.splice(0, userTurns.length - 6);
      }
    } catch (err) {
      debugLogger.debug(
        `[MessageBus] could not read chat history for auto mode: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    return {
      userTurns,
      toolCall: message.toolCall,
      serverName: message.serverName,
      workspaceDir: this.config!.getProjectRoot(),
      trustedDomains: this.config!.getTrustedDomains(),
    };
  }

  private getAutoModeCounters(scope: string | undefined): {
    consecutive: number;
    total: number;
  } {
    const key = scope ?? '__default__';
    let counters = this.autoModeDenialCounters.get(key);
    if (!counters) {
      counters = { consecutive: 0, total: 0 };
      this.autoModeDenialCounters.set(key, counters);
    }
    return counters;
  }

  private recordAutoModeDecision(
    scope: string | undefined,
    outcome: 'allow' | 'deny',
  ): void {
    const counters = this.getAutoModeCounters(scope);
    if (outcome === 'deny') {
      counters.consecutive += 1;
      counters.total += 1;
    } else {
      counters.consecutive = 0;
    }
  }

  private fallbackToAskUser(
    message: Extract<Message, { type: MessageBusType.TOOL_CONFIRMATION_REQUEST }>,
  ): void {
    this.recordAutoModeDecision(message.subagent, 'deny');
    if (
      this.listenerCount(MessageBusType.TOOL_CONFIRMATION_REQUEST) > 0
    ) {
      this.emitMessage(message);
    } else {
      this.emitMessage({
        type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
        correlationId: message.correlationId,
        confirmed: false,
        requiresUserConfirmation: true,
      });
    }
  }

  subscribe<T extends Message>(
    type: T['type'],
    listener: (message: T) => void,
    options?: { signal?: AbortSignal },
  ): void {
    if (options?.signal) {
      const signal = options.signal;
      if (signal.aborted) return;

      if (this.listenerToAbortCleanup.get(listener)?.has(type)) return;

      const abortHandler = () => {
        this.off(type, listener);
        const typeToCleanup = this.listenerToAbortCleanup.get(listener);
        if (typeToCleanup) {
          typeToCleanup.delete(type);
          if (typeToCleanup.size === 0) {
            this.listenerToAbortCleanup.delete(listener);
          }
        }
      };
      signal.addEventListener('abort', abortHandler, { once: true });

      let typeToCleanup = this.listenerToAbortCleanup.get(listener);
      if (!typeToCleanup) {
        typeToCleanup = new Map<string, () => void>();
        this.listenerToAbortCleanup.set(listener, typeToCleanup);
      }
      typeToCleanup.set(type, () => {
        signal.removeEventListener('abort', abortHandler);
      });
    }

    this.on(type, listener);
  }

  unsubscribe<T extends Message>(
    type: T['type'],
    listener: (message: T) => void,
  ): void {
    this.off(type, listener);
    const typeToCleanup = this.listenerToAbortCleanup.get(listener);
    if (typeToCleanup) {
      const cleanup = typeToCleanup.get(type);
      if (cleanup) {
        cleanup();
        typeToCleanup.delete(type);
      }
      if (typeToCleanup.size === 0) {
        this.listenerToAbortCleanup.delete(listener);
      }
    }
  }

  /**
   * Request-response pattern: Publish a message and wait for a correlated response
   * This enables synchronous-style communication over the async MessageBus
   * The correlation ID is generated internally and added to the request
   */
  async request<TRequest extends Message, TResponse extends Message>(
    request: Omit<TRequest, 'correlationId'>,
    responseType: TResponse['type'],
    timeoutMs: number = 60000,
  ): Promise<TResponse> {
    const correlationId = randomUUID();

    return new Promise<TResponse>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(`Request timed out waiting for ${responseType}`));
      }, timeoutMs);

      const cleanup = () => {
        clearTimeout(timeoutId);
        this.unsubscribe(responseType, responseHandler);
      };

      const responseHandler = (response: TResponse) => {
        // Check if this response matches our request
        if (
          'correlationId' in response &&
          response.correlationId === correlationId
        ) {
          cleanup();
          resolve(response);
        }
      };

      // Subscribe to responses
      this.subscribe<TResponse>(responseType, responseHandler);

      // Publish the request with correlation ID
      // eslint-disable-next-line @typescript-eslint/no-floating-promises, @typescript-eslint/no-unsafe-type-assertion
      this.publish({ ...request, correlationId } as TRequest);
    });
  }
}
