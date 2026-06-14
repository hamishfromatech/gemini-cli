/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

export enum TelemetryTarget {
  GCP = 'gcp',
  LOCAL = 'local',
}

const DEFAULT_TELEMETRY_TARGET = TelemetryTarget.LOCAL;
const DEFAULT_OTLP_ENDPOINT = 'http://localhost:4317';

export { DEFAULT_TELEMETRY_TARGET, DEFAULT_OTLP_ENDPOINT };

export function initializeTelemetry(_config?: unknown): void {
  // No-op: A-Coder CLI does not ship with external telemetry.
}

export function shutdownTelemetry(): Promise<void> {
  return Promise.resolve();
}

export function flushTelemetry(): Promise<void> {
  return Promise.resolve();
}

export function isTelemetrySdkInitialized(): boolean {
  return false;
}

export interface ResolvedTelemetrySettings {
  enabled: boolean;
  traces: boolean;
  target: TelemetryTarget;
  otlpEndpoint?: string;
  otlpProtocol?: 'grpc' | 'http';
  logPrompts: boolean;
  outfile?: string;
  useCollector: boolean;
  useCliAuth: boolean;
}

export function resolveTelemetrySettings(_opts: {
  env: Record<string, string | undefined>;
  settings?: Partial<ResolvedTelemetrySettings>;
}): ResolvedTelemetrySettings {
  return {
    enabled: false,
    traces: false,
    target: TelemetryTarget.LOCAL,
    otlpEndpoint: undefined,
    otlpProtocol: 'http',
    logPrompts: false,
    outfile: undefined,
    useCollector: false,
    useCliAuth: false,
  };
}

export function parseBooleanEnvFlag(_value: string | undefined): boolean {
  return false;
}

export function parseTelemetryTargetValue(
  _value: string | undefined,
): TelemetryTarget {
  return TelemetryTarget.LOCAL;
}

export {
  logCliConfiguration,
  logUserPrompt,
  logToolCall,
  logApiRequest,
  logApiError,
  logApiResponse,
  logFlashFallback,
  logSlashCommand,
  logConversationFinishedEvent,
  logChatCompression,
  logToolOutputTruncated,
  logExtensionEnable,
  logExtensionInstallEvent,
  logExtensionUninstall,
  logExtensionUpdateEvent,
  logWebFetchFallbackAttempt,
  logNetworkRetryAttempt,
  logRewind,
  logOnboardingStart,
  logOnboardingSuccess,
} from './loggers.js';

export type { SlashCommandEvent, ChatCompressionEvent } from './types.js';
export {
  SlashCommandStatus,
  EndSessionEvent,
  UserPromptEvent,
  ApiRequestEvent,
  ApiErrorEvent,
  ApiResponseEvent,
  FlashFallbackEvent,
  StartSessionEvent,
  ToolCallEvent,
  ConversationFinishedEvent,
  ToolOutputTruncatedEvent,
  WebFetchFallbackAttemptEvent,
  NetworkRetryAttemptEvent,
  ToolCallDecision,
  RewindEvent,
  OnboardingStartEvent,
  OnboardingSuccessEvent,
  ConsecaPolicyGenerationEvent,
  ConsecaVerdictEvent,
} from './types.js';

export { LlmRole } from './llmRole.js';
export { makeSlashCommandEvent, makeChatCompressionEvent } from './types.js';
export type { TelemetryEvent } from './types.js';

export { SpanStatusCode, ValueType } from './metrics.js';
export { SemanticAttributes } from './types.js';
export * from './uiTelemetry.js';
export * from './billingEvents.js';

export {
  // Core metrics functions
  recordToolCallMetrics,
  recordTokenUsageMetrics,
  recordApiResponseMetrics,
  recordApiErrorMetrics,
  recordFileOperationMetric,
  recordInvalidChunk,
  recordRetryAttemptMetrics,
  recordContentRetry,
  recordContentRetryFailure,
  recordModelRoutingMetrics,
  // Custom metrics for token usage and API responses
  recordCustomTokenUsageMetrics,
  recordCustomApiResponseMetrics,
  recordExitFail,
  // GenAI semantic convention for token usage and operation duration
  recordGenAiClientTokenUsage,
  recordGenAiClientOperationDuration,
  getConventionAttributes,
  // Performance monitoring functions
  recordStartupPerformance,
  recordMemoryUsage,
  recordCpuUsage,
  recordEventLoopDelay,
  recordToolQueueDepth,
  recordToolExecutionBreakdown,
  recordTokenEfficiency,
  recordApiRequestBreakdown,
  recordPerformanceScore,
  recordPerformanceRegression,
  recordBaselineComparison,
  isPerformanceMonitoringActive,
  recordFlickerFrame,
  recordSlowRender,
  // Performance monitoring types
  PerformanceMetricType,
  MemoryMetricType,
  ToolExecutionPhase,
  ApiRequestPhase,
  FileOperation,
  // GenAI semantic convention types
  GenAiOperationName,
  GenAiProviderName,
  GenAiTokenType,
  // Billing metrics functions
  recordOverageOptionSelected,
  recordCreditPurchaseClick,
} from './metrics.js';

export { runInDevTraceSpan, type SpanMetadata } from './trace.js';
export * from './constants.js';

export function logConsecaPolicyGeneration(
  _config: unknown,
  ..._args: unknown[]
): void {}

export function logConsecaVerdict(
  _config: unknown,
  ..._args: unknown[]
): void {}
