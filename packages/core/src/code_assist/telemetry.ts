/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type { GenerateContentResponse } from '@google/genai';
import type {
  ConversationInteraction,
  ConversationOffered,
  StreamingLatency,
} from './types.js';
import type { CompletedToolCall } from '../scheduler/types.js';
import type { Config } from '../config/config.js';
import type { CodeAssistServer } from './server.js';

export async function recordConversationOffered(
   
  _server: CodeAssistServer,
   
  _traceId: string | undefined,
   
  _response: GenerateContentResponse,
   
  _streamingLatency: StreamingLatency,
   
  _abortSignal: AbortSignal | undefined,
   
  _trajectoryId: string | undefined,
): Promise<void> {
  // No-op: do not send telemetry to Google endpoints in the stub.
}

export async function recordToolCallInteractions(
   
  _config: Config,
   
  _toolCalls: CompletedToolCall[],
): Promise<void> {
  // No-op: do not send telemetry to Google endpoints in the stub.
}

export function createConversationOffered(
   
  _response: GenerateContentResponse,
   
  _traceId: string,
   
  _signal: AbortSignal | undefined,
   
  _streamingLatency: StreamingLatency,
   
  _trajectoryId: string | undefined,
): ConversationOffered | undefined {
  return undefined;
}

export function formatProtoJsonDuration(milliseconds: number): string {
  return `${milliseconds / 1000}s`;
}
