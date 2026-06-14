/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type { Config } from '../config/config.js';
import type {
  ModelRoutingEvent,
  ModelSlashCommandEvent,
  AgentFinishEvent,
  RecoveryAttemptEvent,
  KeychainAvailabilityEvent,
  TokenStorageInitializationEvent,
} from './types.js';

const EVENT_CHAT_COMPRESSION = 'gemini_cli.chat_compression';
const TOOL_CALL_COUNT = 'gemini_cli.tool.call.count';
const TOOL_CALL_LATENCY = 'gemini_cli.tool.call.latency';
const API_REQUEST_COUNT = 'gemini_cli.api.request.count';
const API_REQUEST_LATENCY = 'gemini_cli.api.request.latency';
const TOKEN_USAGE = 'gemini_cli.token.usage';
const SESSION_COUNT = 'gemini_cli.session.count';
const FILE_OPERATION_COUNT = 'gemini_cli.file.operation.count';
const LINES_CHANGED = 'gemini_cli.lines.changed';
const INVALID_CHUNK_COUNT = 'gemini_cli.chat.invalid_chunk.count';
const CONTENT_RETRY_COUNT = 'gemini_cli.chat.content_retry.count';
const CONTENT_RETRY_FAILURE_COUNT =
  'gemini_cli.chat.content_retry_failure.count';
const NETWORK_RETRY_COUNT = 'gemini_cli.network_retry.count';
const MODEL_ROUTING_LATENCY = 'gemini_cli.model_routing.latency';
const MODEL_ROUTING_FAILURE_COUNT = 'gemini_cli.model_routing.failure.count';
const MODEL_SLASH_COMMAND_CALL_COUNT =
  'gemini_cli.slash_command.model.call_count';
const EVENT_HOOK_CALL_COUNT = 'gemini_cli.hook_call.count';
const EVENT_HOOK_CALL_LATENCY = 'gemini_cli.hook_call.latency';
const KEYCHAIN_AVAILABILITY_COUNT = 'gemini_cli.keychain.availability.count';
const TOKEN_STORAGE_TYPE_COUNT = 'gemini_cli.token_storage.type.count';
const OVERAGE_OPTION_COUNT = 'gemini_cli.overage_option.count';
const CREDIT_PURCHASE_COUNT = 'gemini_cli.credit_purchase.count';
const EVENT_ONBOARDING_START = 'gemini_cli.onboarding.start';
const EVENT_ONBOARDING_SUCCESS = 'gemini_cli.onboarding.success';
const EVENT_ONBOARDING_DURATION_MS = 'gemini_cli.onboarding.duration';

// Agent Metrics
const AGENT_RUN_COUNT = 'gemini_cli.agent.run.count';
const AGENT_DURATION_MS = 'gemini_cli.agent.duration';
const AGENT_TURNS = 'gemini_cli.agent.turns';
const AGENT_RECOVERY_ATTEMPT_COUNT = 'gemini_cli.agent.recovery_attempt.count';
const AGENT_RECOVERY_ATTEMPT_DURATION =
  'gemini_cli.agent.recovery_attempt.duration';

// Browser Agent Metrics
const BROWSER_AGENT_CONNECTION_DURATION =
  'gemini_cli.browser_agent.connection.duration';
const BROWSER_AGENT_CONNECTION_FAILURE_COUNT =
  'gemini_cli.browser_agent.connection.failure.count';
const BROWSER_AGENT_TOOLS_DISCOVERED =
  'gemini_cli.browser_agent.tools.discovered';
const BROWSER_AGENT_TOOLS_MISSING_SEMANTIC =
  'gemini_cli.browser_agent.tools.missing_semantic';
const BROWSER_AGENT_VISION_STATUS = 'gemini_cli.browser_agent.vision.status';
const BROWSER_AGENT_TASK_OUTCOME = 'gemini_cli.browser_agent.task.outcome';
const BROWSER_AGENT_TASK_DURATION = 'gemini_cli.browser_agent.task.duration';
const BROWSER_AGENT_CLEANUP_DURATION =
  'gemini_cli.browser_agent.cleanup.duration';
const BROWSER_AGENT_CLEANUP_FAILURE_COUNT =
  'gemini_cli.browser_agent.cleanup.failure.count';

// OpenTelemetry GenAI Semantic Convention Metrics
const GEN_AI_CLIENT_TOKEN_USAGE = 'gen_ai.client.token.usage';
const GEN_AI_CLIENT_OPERATION_DURATION = 'gen_ai.client.operation.duration';

// Performance Monitoring Metrics
const STARTUP_TIME = 'gemini_cli.startup.duration';
const MEMORY_USAGE = 'gemini_cli.memory.usage';
const CPU_USAGE = 'gemini_cli.cpu.usage';
const EVENT_LOOP_DELAY = 'gemini_cli.event_loop.delay';
const TOOL_QUEUE_DEPTH = 'gemini_cli.tool.queue.depth';
const TOOL_EXECUTION_BREAKDOWN = 'gemini_cli.tool.execution.breakdown';
const TOKEN_EFFICIENCY = 'gemini_cli.token.efficiency';
const API_REQUEST_BREAKDOWN = 'gemini_cli.api.request.breakdown';
const PERFORMANCE_SCORE = 'gemini_cli.performance.score';
const REGRESSION_DETECTION = 'gemini_cli.performance.regression';
const REGRESSION_PERCENTAGE_CHANGE =
  'gemini_cli.performance.regression.percentage_change';
const BASELINE_COMPARISON = 'gemini_cli.performance.baseline.comparison';
const FLICKER_FRAME_COUNT = 'gemini_cli.ui.flicker.count';
const SLOW_RENDER_LATENCY = 'gemini_cli.ui.slow_render.latency';
const EXIT_FAIL_COUNT = 'gemini_cli.exit.fail.count';
const PLAN_EXECUTION_COUNT = 'gemini_cli.plan.execution.count';

export type Attributes = Record<string, string | number | boolean | unknown>;

export enum ValueType {
  INT = 0,
  DOUBLE = 1,
}

export enum SpanStatusCode {
  UNSET = 0,
  OK = 1,
  ERROR = 2,
}

export type MetricDefinitions = Record<
  string,
  { attributes: Record<string, unknown> }
>;

export enum FileOperation {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
}

export enum PerformanceMetricType {
  STARTUP = 'startup',
  MEMORY = 'memory',
  CPU = 'cpu',
  TOOL_EXECUTION = 'tool_execution',
  API_REQUEST = 'api_request',
  TOKEN_EFFICIENCY = 'token_efficiency',
}

export enum MemoryMetricType {
  HEAP_USED = 'heap_used',
  HEAP_TOTAL = 'heap_total',
  EXTERNAL = 'external',
  RSS = 'rss',
}

export enum ToolExecutionPhase {
  VALIDATION = 'validation',
  PREPARATION = 'preparation',
  EXECUTION = 'execution',
  RESULT_PROCESSING = 'result_processing',
}

export enum ApiRequestPhase {
  REQUEST_PREPARATION = 'request_preparation',
  NETWORK_LATENCY = 'network_latency',
  RESPONSE_PROCESSING = 'response_processing',
  TOKEN_PROCESSING = 'token_processing',
}

export enum GenAiOperationName {
  GENERATE_CONTENT = 'generate_content',
}

export enum GenAiProviderName {
  GCP_GEN_AI = 'gcp.gen_ai',
  GCP_VERTEX_AI = 'gcp.vertex_ai',
}

export enum GenAiTokenType {
  INPUT = 'input',
  OUTPUT = 'output',
}

let isMetricsInitialized = false;
const isPerformanceMonitoringEnabled = false;

export function initializeMetrics(_config: Config): void {
  isMetricsInitialized = true;
}

export function recordChatCompressionMetrics(
  _config: Config,
  _attributes: MetricDefinitions[typeof EVENT_CHAT_COMPRESSION]['attributes'],
) {
  // No-op: telemetry is disabled.
}

export function recordToolCallMetrics(
  _config: Config,
  _durationMs: number,
  _attributes: MetricDefinitions[typeof TOOL_CALL_COUNT]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function recordCustomTokenUsageMetrics(
  _config: Config,
  _tokenCount: number,
  _attributes: MetricDefinitions[typeof TOKEN_USAGE]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function recordCustomApiResponseMetrics(
  _config: Config,
  _durationMs: number,
  _attributes: MetricDefinitions[typeof API_REQUEST_COUNT]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function recordApiErrorMetrics(
  _config: Config,
  _durationMs: number,
  _attributes: MetricDefinitions[typeof API_REQUEST_COUNT]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function recordFileOperationMetric(
  _config: Config,
  _attributes: MetricDefinitions[typeof FILE_OPERATION_COUNT]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function recordLinesChanged(
  _config: Config,
  _lines: number,
  _changeType: 'added' | 'removed',
  _attributes?: { function_name?: string },
): void {
  // No-op: telemetry is disabled.
}

/**
 * Records a metric for when the auth process starts.
 */
export function recordOnboardingStart(_config: Config): void {
  // No-op: telemetry is disabled.
}

/**
 * Records a metric for when the auth process ends successfully.
 */
export function recordOnboardingSuccess(
  _config: Config,
  _userTier?: string,
  _durationMs?: number,
): void {
  // No-op: telemetry is disabled.
}

/**
 * Records a metric for when a UI frame flickers.
 */
export function recordFlickerFrame(_config: Config): void {
  // No-op: telemetry is disabled.
}

/**
 * Records a metric for when user failed to exit
 */
export function recordExitFail(_config: Config): void {
  // No-op: telemetry is disabled.
}

/**
 * Records a metric for when a plan is executed.
 */
export function recordPlanExecution(
  _config: Config,
  _attributes: MetricDefinitions[typeof PLAN_EXECUTION_COUNT]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

/**
 * Records a metric for when a UI frame is slow in rendering
 */
export function recordSlowRender(_config: Config, _renderLatency: number): void {
  // No-op: telemetry is disabled.
}

/**
 * Records a metric for when an invalid chunk is received from a stream.
 */
export function recordInvalidChunk(_config: Config): void {
  // No-op: telemetry is disabled.
}

export function recordRetryAttemptMetrics(
  _config: Config,
  _attributes: {
    model: string;
    attempt: number;
  },
): void {
  // No-op: telemetry is disabled.
}

/**
 * Records a metric for when a retry is triggered due to a content error.
 */
export function recordContentRetry(_config: Config): void {
  // No-op: telemetry is disabled.
}

/**
 * Records a metric for when all content error retries have failed for a request.
 */
export function recordContentRetryFailure(_config: Config): void {
  // No-op: telemetry is disabled.
}

export function recordModelSlashCommand(
  _config: Config,
  _event: ModelSlashCommandEvent,
): void {
  // No-op: telemetry is disabled.
}

export function recordModelRoutingMetrics(
  _config: Config,
  _event: ModelRoutingEvent,
): void {
  // No-op: telemetry is disabled.
}

export function recordAgentRunMetrics(
  _config: Config,
  _event: AgentFinishEvent,
): void {
  // No-op: telemetry is disabled.
}

export function recordRecoveryAttemptMetrics(
  _config: Config,
  _event: RecoveryAttemptEvent,
): void {
  // No-op: telemetry is disabled.
}

// OpenTelemetry GenAI Semantic Convention Recording Functions

export function recordGenAiClientTokenUsage(
  _config: Config,
  _tokenCount: number,
  _attributes: MetricDefinitions[typeof GEN_AI_CLIENT_TOKEN_USAGE]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function recordGenAiClientOperationDuration(
  _config: Config,
  _durationSeconds: number,
  _attributes: MetricDefinitions[typeof GEN_AI_CLIENT_OPERATION_DURATION]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function getConventionAttributes(event: {
  model: string;
  auth_type?: string;
}): {
  'gen_ai.operation.name': GenAiOperationName;
  'gen_ai.provider.name': GenAiProviderName;
  'gen_ai.request.model': string;
  'gen_ai.response.model': string;
} {
  return {
    'gen_ai.operation.name': GenAiOperationName.GENERATE_CONTENT,
    'gen_ai.provider.name': GenAiProviderName.GCP_GEN_AI,
    'gen_ai.request.model': event.model,
    'gen_ai.response.model': event.model,
  };
}

// Performance Monitoring Functions

export function recordStartupPerformance(
  _config: Config,
  _durationMs: number,
  _attributes: MetricDefinitions[typeof STARTUP_TIME]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function recordMemoryUsage(
  _config: Config,
  _bytes: number,
  _attributes: MetricDefinitions[typeof MEMORY_USAGE]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function recordCpuUsage(
  _config: Config,
  _percentage: number,
  _attributes: MetricDefinitions[typeof CPU_USAGE]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function recordEventLoopDelay(
  _config: Config,
  _delayMs: number,
  _attributes: MetricDefinitions[typeof EVENT_LOOP_DELAY]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function recordToolQueueDepth(_config: Config, _queueDepth: number): void {
  // No-op: telemetry is disabled.
}

export function recordToolExecutionBreakdown(
  _config: Config,
  _durationMs: number,
  _attributes: MetricDefinitions[typeof TOOL_EXECUTION_BREAKDOWN]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function recordTokenEfficiency(
  _config: Config,
  _value: number,
  _attributes: MetricDefinitions[typeof TOKEN_EFFICIENCY]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function recordApiRequestBreakdown(
  _config: Config,
  _durationMs: number,
  _attributes: MetricDefinitions[typeof API_REQUEST_BREAKDOWN]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function recordPerformanceScore(
  _config: Config,
  _score: number,
  _attributes: MetricDefinitions[typeof PERFORMANCE_SCORE]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function recordPerformanceRegression(
  _config: Config,
  _attributes: MetricDefinitions[typeof REGRESSION_DETECTION]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function recordBaselineComparison(
  _config: Config,
  _attributes: MetricDefinitions[typeof BASELINE_COMPARISON]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

// Utility function to check if performance monitoring is enabled
export function isPerformanceMonitoringActive(): boolean {
  return isPerformanceMonitoringEnabled && isMetricsInitialized;
}

/**
 * Token usage recording that emits both custom and convention metrics.
 */
export function recordTokenUsageMetrics(
  _config: Config,
  _tokenCount: number,
  _attributes: {
    model: string;
    type: 'input' | 'output' | 'thought' | 'cache' | 'tool';
    genAiAttributes?: {
      'gen_ai.operation.name': string;
      'gen_ai.provider.name': string;
      'gen_ai.request.model'?: string;
      'gen_ai.response.model'?: string;
      'server.address'?: string;
      'server.port'?: number;
    };
  },
): void {
  // No-op: telemetry is disabled.
}

/**
 * Operation latency recording that emits both custom and convention metrics.
 */
export function recordApiResponseMetrics(
  _config: Config,
  _durationMs: number,
  _attributes: {
    model: string;
    status_code?: number | string;
    genAiAttributes?: {
      'gen_ai.operation.name': string;
      'gen_ai.provider.name': string;
      'gen_ai.request.model'?: string;
      'gen_ai.response.model'?: string;
      'server.address'?: string;
      'server.port'?: number;
      'error.type'?: string;
    };
  },
): void {
  // No-op: telemetry is disabled.
}

export function recordHookCallMetrics(
  _config: Config,
  _hookEventName: string,
  _hookName: string,
  _durationMs: number,
  _success: boolean,
): void {
  // No-op: telemetry is disabled.
}

/**
 * Records a metric for keychain availability.
 */
export function recordKeychainAvailability(
  _config: Config,
  _event: KeychainAvailabilityEvent,
): void {
  // No-op: telemetry is disabled.
}

/**
 * Records a metric for token storage type initialization.
 */
export function recordTokenStorageInitialization(
  _config: Config,
  _event: TokenStorageInitializationEvent,
): void {
  // No-op: telemetry is disabled.
}

/**
 * Records a metric for an overage option selection.
 */
export function recordOverageOptionSelected(
  _config: Config,
  _attributes: MetricDefinitions[typeof OVERAGE_OPTION_COUNT]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

/**
 * Records a metric for a credit purchase link click.
 */
export function recordCreditPurchaseClick(
  _config: Config,
  _attributes: MetricDefinitions[typeof CREDIT_PURCHASE_COUNT]['attributes'],
): void {
  // No-op: telemetry is disabled.
}

export function recordBrowserAgentConnection(
  _config: Config,
  _durationMs: number,
  _attributes: {
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
  // No-op: telemetry is disabled.
}

export function recordBrowserAgentToolDiscovery(
  _config: Config,
  _toolCount: number,
  _missingSemanticTools: string[],
  _sessionMode: 'persistent' | 'isolated' | 'existing',
): void {
  // No-op: telemetry is disabled.
}

export function recordBrowserAgentVisionStatus(
  _config: Config,
  _attributes: {
    enabled: boolean;
    disabled_reason?:
      | 'no_visual_model'
      | 'missing_visual_tools'
      | 'blocked_auth_type';
  },
): void {
  // No-op: telemetry is disabled.
}

export function recordBrowserAgentTaskOutcome(
  _config: Config,
  _attributes: {
    success: boolean;
    session_mode: 'persistent' | 'isolated' | 'existing';
    vision_enabled: boolean;
    headless: boolean;
    duration_ms: number;
  },
): void {
  // No-op: telemetry is disabled.
}

export function recordBrowserAgentCleanup(
  _config: Config,
  _durationMs: number,
  _attributes: {
    session_mode: 'persistent' | 'isolated' | 'existing';
    success: boolean;
  },
): void {
  // No-op: telemetry is disabled.
}
