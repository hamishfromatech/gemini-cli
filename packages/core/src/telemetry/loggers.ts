/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type { Config } from '../config/config.js';
import {
  EVENT_API_ERROR,
  EVENT_API_RESPONSE,
  EVENT_TOOL_CALL,
  EVENT_REWIND,
  type ApiErrorEvent,
  type ApiRequestEvent,
  type ApiResponseEvent,
  type FileOperationEvent,
  type IdeConnectionEvent,
  type StartSessionEvent,
  type ToolCallEvent,
  type UserPromptEvent,
  type FlashFallbackEvent,
  type NextSpeakerCheckEvent,
  type LoopDetectedEvent,
  type LoopDetectionDisabledEvent,
  type SlashCommandEvent,
  type RewindEvent,
  type ConversationFinishedEvent,
  type ChatCompressionEvent,
  type MalformedJsonResponseEvent,
  type InvalidChunkEvent,
  type ContentRetryEvent,
  type ContentRetryFailureEvent,
  type NetworkRetryAttemptEvent,
  type RipgrepFallbackEvent,
  type ToolOutputTruncatedEvent,
  type ModelRoutingEvent,
  type ExtensionDisableEvent,
  type ExtensionEnableEvent,
  type ExtensionUninstallEvent,
  type ExtensionInstallEvent,
  type ModelSlashCommandEvent,
  type EditStrategyEvent,
  type EditCorrectionEvent,
  type AgentStartEvent,
  type AgentFinishEvent,
  type RecoveryAttemptEvent,
  type WebFetchFallbackAttemptEvent,
  type ExtensionUpdateEvent,
  type ApprovalModeSwitchEvent,
  type ApprovalModeDurationEvent,
  type HookCallEvent,
  type StartupStatsEvent,
  type LlmLoopCheckEvent,
  type PlanExecutionEvent,
  type ToolOutputMaskingEvent,
  type KeychainAvailabilityEvent,
  type TokenStorageInitializationEvent,
  type OnboardingStartEvent,
  type OnboardingSuccessEvent,
  type BillingTelemetryEvent,
  type TelemetryEvent,
  CreditsUsedEvent,
  OverageOptionSelectedEvent,
  EmptyWalletMenuShownEvent,
  CreditPurchaseClickEvent,
} from './types.js';

import {
  recordApiErrorMetrics,
  recordToolCallMetrics,
  recordChatCompressionMetrics,
  recordFileOperationMetric,
  recordRetryAttemptMetrics,
  recordContentRetry,
  recordContentRetryFailure,
  recordModelRoutingMetrics,
  recordModelSlashCommand,
  getConventionAttributes,
  recordTokenUsageMetrics,
  recordApiResponseMetrics,
  recordAgentRunMetrics,
  recordRecoveryAttemptMetrics,
  recordLinesChanged,
  recordHookCallMetrics,
  recordPlanExecution,
  recordKeychainAvailability,
  recordTokenStorageInitialization,
  recordInvalidChunk,
  recordOnboardingStart,
  recordOnboardingSuccess,
  recordBrowserAgentConnection,
  recordBrowserAgentVisionStatus,
  recordBrowserAgentTaskOutcome,
  recordBrowserAgentCleanup,
} from './metrics.js';
import { uiTelemetryService, type UiEvent } from './uiTelemetry.js';

export function logCliConfiguration(
  _config: Config,
  _event: StartSessionEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logUserPrompt(_config: Config, _event: UserPromptEvent): void {
  // No-op: telemetry is disabled.
}

export function logToolCall(_config: Config, event: ToolCallEvent): void {
  const uiEvent = {
    ...event,
    'event.name': EVENT_TOOL_CALL,
    'event.timestamp': new Date().toISOString(),
  } as UiEvent;
  uiTelemetryService.addEvent(uiEvent);

  recordToolCallMetrics(_config, event.duration_ms, {
    function_name: event.function_name,
    success: event.success,
    decision: event.decision,
    tool_type: event.tool_type,
  });

  if (event.metadata) {
    const added = event.metadata['model_added_lines'];
    if (typeof added === 'number' && added > 0) {
      recordLinesChanged(_config, added, 'added', {
        function_name: event.function_name,
      });
    }
    const removed = event.metadata['model_removed_lines'];
    if (typeof removed === 'number' && removed > 0) {
      recordLinesChanged(_config, removed, 'removed', {
        function_name: event.function_name,
      });
    }
  }
}

export function logToolOutputTruncated(
  _config: Config,
  _event: ToolOutputTruncatedEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logToolOutputMasking(
  _config: Config,
  _event: ToolOutputMaskingEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logFileOperation(
  _config: Config,
  event: FileOperationEvent,
): void {
  recordFileOperationMetric(_config, {
    operation: event.operation,
    lines: event.lines,
    mimetype: event.mimetype,
    extension: event.extension,
    programming_language: event.programming_language,
  });
}

export function logApiRequest(_config: Config, _event: ApiRequestEvent): void {
  // No-op: telemetry is disabled.
}

export function logFlashFallback(
  _config: Config,
  _event: FlashFallbackEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logRipgrepFallback(
  _config: Config,
  _event: RipgrepFallbackEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logApiError(_config: Config, event: ApiErrorEvent): void {
  const uiEvent = {
    ...event,
    'event.name': EVENT_API_ERROR,
    'event.timestamp': new Date().toISOString(),
  } as UiEvent;
  uiTelemetryService.addEvent(uiEvent);

  recordApiErrorMetrics(_config, event.duration_ms, {
    model: event.model,
    status_code: event.status_code,
    error_type: event.error_type,
  });

  recordApiResponseMetrics(_config, event.duration_ms, {
    model: event.model,
    status_code: event.status_code,
    genAiAttributes: {
      ...getConventionAttributes(event),
      'error.type': event.error_type || 'unknown',
    },
  });
}

export function logApiResponse(_config: Config, event: ApiResponseEvent): void {
  const uiEvent = {
    ...event,
    'event.name': EVENT_API_RESPONSE,
    'event.timestamp': new Date().toISOString(),
  } as UiEvent;
  uiTelemetryService.addEvent(uiEvent);

  const conventionAttributes = getConventionAttributes(event);

  recordApiResponseMetrics(_config, event.duration_ms, {
    model: event.model,
    status_code: event.status_code,
    genAiAttributes: conventionAttributes,
  });

  const tokenUsageData = [
    { count: event.usage.input_token_count, type: 'input' as const },
    { count: event.usage.output_token_count, type: 'output' as const },
    { count: event.usage.cached_content_token_count, type: 'cache' as const },
    { count: event.usage.thoughts_token_count, type: 'thought' as const },
    { count: event.usage.tool_token_count, type: 'tool' as const },
  ];

  for (const { count, type } of tokenUsageData) {
    recordTokenUsageMetrics(_config, count, {
      model: event.model,
      type,
      genAiAttributes: conventionAttributes,
    });
  }
}

export function logLoopDetected(
  _config: Config,
  _event: LoopDetectedEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logLoopDetectionDisabled(
  _config: Config,
  _event: LoopDetectionDisabledEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logNextSpeakerCheck(
  _config: Config,
  _event: NextSpeakerCheckEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logSlashCommand(
  _config: Config,
  _event: SlashCommandEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logRewind(_config: Config, event: RewindEvent): void {
  const uiEvent = {
    ...event,
    'event.name': EVENT_REWIND,
    'event.timestamp': new Date().toISOString(),
  } as UiEvent;
  uiTelemetryService.addEvent(uiEvent);
}

export function logIdeConnection(
  _config: Config,
  _event: IdeConnectionEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logConversationFinishedEvent(
  _config: Config,
  _event: ConversationFinishedEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logChatCompression(
  _config: Config,
  event: ChatCompressionEvent,
): void {
  recordChatCompressionMetrics(_config, {
    tokens_before: event.tokens_before,
    tokens_after: event.tokens_after,
  });
}

export function logMalformedJsonResponse(
  _config: Config,
  _event: MalformedJsonResponseEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logInvalidChunk(
  _config: Config,
  _event: InvalidChunkEvent,
): void {
  recordInvalidChunk(_config);
}

export function logNetworkRetryAttempt(
  _config: Config,
  event: NetworkRetryAttemptEvent,
): void {
  recordRetryAttemptMetrics(_config, {
    model: event.model,
    attempt: event.attempt,
  });
}

export function logContentRetry(
  _config: Config,
  _event: ContentRetryEvent,
): void {
  recordContentRetry(_config);
}

export function logContentRetryFailure(
  _config: Config,
  _event: ContentRetryFailureEvent,
): void {
  recordContentRetryFailure(_config);
}

export function logModelRouting(
  _config: Config,
  event: ModelRoutingEvent,
): void {
  recordModelRoutingMetrics(_config, event);
}

export function logModelSlashCommand(
  _config: Config,
  event: ModelSlashCommandEvent,
): void {
  recordModelSlashCommand(_config, event);
}

export async function logExtensionInstallEvent(
  _config: Config,
  _event: ExtensionInstallEvent,
): Promise<void> {
  // No-op: telemetry is disabled.
}

export async function logExtensionUninstall(
  _config: Config,
  _event: ExtensionUninstallEvent,
): Promise<void> {
  // No-op: telemetry is disabled.
}

export async function logExtensionUpdateEvent(
  _config: Config,
  _event: ExtensionUpdateEvent,
): Promise<void> {
  // No-op: telemetry is disabled.
}

export async function logExtensionEnable(
  _config: Config,
  _event: ExtensionEnableEvent,
): Promise<void> {
  // No-op: telemetry is disabled.
}

export async function logExtensionDisable(
  _config: Config,
  _event: ExtensionDisableEvent,
): Promise<void> {
  // No-op: telemetry is disabled.
}

export function logEditStrategy(
  _config: Config,
  _event: EditStrategyEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logEditCorrectionEvent(
  _config: Config,
  _event: EditCorrectionEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logAgentStart(_config: Config, _event: AgentStartEvent): void {
  // No-op: telemetry is disabled.
}

export function logAgentFinish(_config: Config, event: AgentFinishEvent): void {
  recordAgentRunMetrics(_config, event);
}

export function logRecoveryAttempt(
  _config: Config,
  event: RecoveryAttemptEvent,
): void {
  recordRecoveryAttemptMetrics(_config, event);
}

export function logWebFetchFallbackAttempt(
  _config: Config,
  _event: WebFetchFallbackAttemptEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logLlmLoopCheck(
  _config: Config,
  _event: LlmLoopCheckEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logApprovalModeSwitch(
  _config: Config,
  _event: ApprovalModeSwitchEvent,
) {
  // No-op: telemetry is disabled.
}

export function logApprovalModeDuration(
  _config: Config,
  _event: ApprovalModeDurationEvent,
) {
  // No-op: telemetry is disabled.
}

export function logPlanExecution(_config: Config, event: PlanExecutionEvent) {
  recordPlanExecution(_config, {
    approval_mode: event.approval_mode,
  });
}

export function logHookCall(_config: Config, event: HookCallEvent): void {
  recordHookCallMetrics(
    _config,
    event.hook_event_name,
    event.hook_name,
    event.duration_ms,
    event.success,
  );
}

export function logStartupStats(
  _config: Config,
  _event: StartupStatsEvent,
): void {
  // No-op: telemetry is disabled.
}

export function logKeychainAvailability(
  _config: Config,
  event: KeychainAvailabilityEvent,
): void {
  recordKeychainAvailability(_config, event);
}

export function logTokenStorageInitialization(
  _config: Config,
  event: TokenStorageInitializationEvent,
): void {
  recordTokenStorageInitialization(_config, event);
}

export function logOnboardingStart(
  _config: Config,
  _event: OnboardingStartEvent,
): void {
  recordOnboardingStart(_config);
}

export function logOnboardingSuccess(
  _config: Config,
  _event: OnboardingSuccessEvent,
): void {
  recordOnboardingSuccess(_config, _event.userTier, _event.duration_ms);
}

export function logBillingEvent(
  _config: Config,
  _event: TelemetryEvent,
): void {
  // No-op: telemetry is disabled.

  const cc = undefined;
  if (cc) {
    if (_event instanceof CreditsUsedEvent) {
      // No-op
    } else if (_event instanceof OverageOptionSelectedEvent) {
      // No-op
    } else if (_event instanceof EmptyWalletMenuShownEvent) {
      // No-op
    } else if (_event instanceof CreditPurchaseClickEvent) {
      // No-op
    }
  }
}

// ==========================================================================
// Browser Agent Events
// ==========================================================================

export function logBrowserAgentConnection(
  _config: Config,
  durationMs: number,
  attributes: {
    session_mode: 'persistent' | 'isolated' | 'existing';
    headless: boolean;
    success: boolean;
    error_type?:
      | 'profile_locked'
      | 'timeout'
      | 'connection_refused'
      | 'unknown';
    tool_count?: number;
  },
): void {
  recordBrowserAgentConnection(_config, durationMs, attributes);
}

export function logBrowserAgentVisionStatus(
  _config: Config,
  attributes: {
    enabled: boolean;
    disabled_reason?:
      | 'no_visual_model'
      | 'missing_visual_tools'
      | 'blocked_auth_type';
  },
): void {
  recordBrowserAgentVisionStatus(_config, attributes);
}

export function logBrowserAgentTaskOutcome(
  _config: Config,
  attributes: {
    success: boolean;
    session_mode: 'persistent' | 'isolated' | 'existing';
    vision_enabled: boolean;
    headless: boolean;
    duration_ms: number;
  },
): void {
  recordBrowserAgentTaskOutcome(_config, attributes);
}

export function logBrowserAgentCleanup(
  _config: Config,
  durationMs: number,
  attributes: {
    session_mode: 'persistent' | 'isolated' | 'existing';
    success: boolean;
  },
): void {
  recordBrowserAgentCleanup(_config, durationMs, attributes);
}
