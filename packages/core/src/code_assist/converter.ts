/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type {
  GenerateContentResponse,
  Content,
  ContentListUnion,
  GenerateContentParameters,
  CountTokensParameters,
  CountTokensResponse,
  GenerationConfigRoutingConfig,
  MediaResolution,
  Candidate,
  GenerateContentResponsePromptFeedback,
  GenerateContentResponseUsageMetadata,
  Part,
  SafetySetting,
  PartUnion,
  SpeechConfigUnion,
  ThinkingConfig,
  ToolListUnion,
  ToolConfig,
  ModelSelectionConfig,
} from '@google/genai';
import type { Credits } from './types.js';

export interface CAGenerateContentRequest {
  model: string;
  project?: string;
  user_prompt_id?: string;
  request: VertexGenerateContentRequest;
  enabled_credit_types?: string[];
}

interface VertexGenerateContentRequest {
  contents: Content[];
  systemInstruction?: Content;
  cachedContent?: string;
  tools?: ToolListUnion;
  toolConfig?: ToolConfig;
  labels?: Record<string, string>;
  safetySettings?: SafetySetting[];
  generationConfig?: VertexGenerationConfig;
  session_id?: string;
}

interface VertexGenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  candidateCount?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  responseLogprobs?: boolean;
  logprobs?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  seed?: number;
  responseMimeType?: string;
  responseJsonSchema?: unknown;
  responseSchema?: unknown;
  routingConfig?: GenerationConfigRoutingConfig;
  modelSelectionConfig?: ModelSelectionConfig;
  responseModalities?: string[];
  mediaResolution?: MediaResolution;
  speechConfig?: SpeechConfigUnion;
  audioTimestamp?: boolean;
  thinkingConfig?: ThinkingConfig;
}

export interface CaGenerateContentResponse {
  response?: VertexGenerateContentResponse;
  traceId?: string;
  consumedCredits?: Credits[];
  remainingCredits?: Credits[];
}

interface VertexGenerateContentResponse {
  candidates?: Candidate[];
  automaticFunctionCallingHistory?: Content[];
  promptFeedback?: GenerateContentResponsePromptFeedback;
  usageMetadata?: GenerateContentResponseUsageMetadata;
  modelVersion?: string;
}

export interface CaCountTokenRequest {
  request: VertexCountTokenRequest;
}

interface VertexCountTokenRequest {
  model: string;
  contents: Content[];
}

export interface CaCountTokenResponse {
  totalTokens?: number;
}

export function toCountTokenRequest(
  req: CountTokensParameters,
): CaCountTokenRequest {
  return {
    request: {
      model: 'models/' + req.model,
      contents: [] as Content[],
    },
  };
}

export function fromCountTokenResponse(
  res: CaCountTokenResponse,
): CountTokensResponse {
  return {
    totalTokens: res.totalTokens ?? 0,
  };
}

export function toGenerateContentRequest(
  req: GenerateContentParameters,
  userPromptId: string,
  project?: string,
  sessionId?: string,
  enabledCreditTypes?: string[],
): CAGenerateContentRequest {
  return {
    model: req.model,
    project,
    user_prompt_id: userPromptId,
    request: {} as VertexGenerateContentRequest,
    enabled_credit_types: enabledCreditTypes,
  };
}

export function fromGenerateContentResponse(
  res: CaGenerateContentResponse,
): GenerateContentResponse {
  const response = res.response;
  if (!response) {
    return { candidates: [] } as unknown as GenerateContentResponse;
  }
  return {
    responseId: res.traceId,
    candidates: response.candidates ?? [],
    automaticFunctionCallingHistory: response.automaticFunctionCallingHistory,
    promptFeedback: response.promptFeedback,
    usageMetadata: response.usageMetadata,
    modelVersion: response.modelVersion,
  } as GenerateContentResponse;
}

export function toContents(contents: ContentListUnion): Content[] {
  void contents;
  return [];
}

export function toParts(parts: PartUnion[]): Part[] {
  void parts;
  return [];
}

export function fromGenerateContentResponseUsage(
  metadata?: GenerateContentResponseUsageMetadata,
): GenerateContentResponseUsageMetadata | undefined {
  return metadata;
}
