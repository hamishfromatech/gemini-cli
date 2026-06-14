/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import {
  type CountTokensResponse,
  type CountTokensParameters,
  type EmbedContentResponse,
  type EmbedContentParameters,
  type GenerateContentResponse,
  type GenerateContentParameters,
} from '@google/genai';
import type { Config } from '../config/config.js';
import { LoggingContentGenerator } from './loggingContentGenerator.js';
import { FakeContentGenerator } from './fakeContentGenerator.js';
import { ModelMappingContentGenerator } from './modelMappingContentGenerator.js';
import { RecordingContentGenerator } from './recordingContentGenerator.js';
import { CCPA_AI_MODEL_MAPPINGS } from '../config/models.js';
import { OpenAIContentGenerator } from './openaiContentGenerator.js';
import type { LlmRole } from '../telemetry/llmRole.js';

export interface ContentGenerator {
  generateContent(
    request: GenerateContentParameters,
    userPromptId: string,
    role: LlmRole,
  ): Promise<GenerateContentResponse>;

  generateContentStream(
    request: GenerateContentParameters,
    userPromptId: string,
    role: LlmRole,
  ): Promise<AsyncGenerator<GenerateContentResponse>>;

  countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;

  embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;

  userTier?: string;
  userTierName?: string;
  paidTier?: unknown;
}

export enum AuthType {
  USE_OPENAI = 'openai',
  USE_OPENAI_COMPATIBLE = 'openai-compatible',
  /** @deprecated Google OAuth is no longer supported. Kept for migration. */
  LOGIN_WITH_GOOGLE = 'oauth-personal',
  /** @deprecated Google GenAI API key auth is no longer supported. Kept for migration. */
  USE_GEMINI = 'gemini-api-key',
  /** @deprecated Vertex AI is no longer supported. Kept for migration. */
  USE_VERTEX_AI = 'vertex-ai',
  /** @deprecated Cloud Shell auth is no longer supported. Kept for migration. */
  LEGACY_CLOUD_SHELL = 'cloud-shell',
  /** @deprecated Compute ADC is no longer supported. Kept for migration. */
  COMPUTE_ADC = 'compute-default-credentials',
  GATEWAY = 'gateway',
}

export type VertexAiRoutingConfig = {
  requestType?: 'dedicated' | 'shared';
  sharedRequestType?: 'priority' | 'flex';
};

export type ContentGeneratorConfig = {
  model?: string;
  apiKey?: string;
  authType?: AuthType;
  baseUrl?: string;
  vertexai?: boolean;
  vertexAiRouting?: VertexAiRoutingConfig;
};

export function getAuthTypeFromEnv(): AuthType | undefined {
  if (
    process.env['A_CODER_API_KEY'] ||
    process.env['OPENAI_API_KEY']
  ) {
    return AuthType.USE_OPENAI;
  }
  if (process.env['A_CODER_BASE_URL'] || process.env['OPENAI_BASE_URL']) {
    return AuthType.USE_OPENAI_COMPATIBLE;
  }
  return undefined;
}

export async function createContentGeneratorConfig(
  model: string | undefined,
  authType: AuthType | undefined,
  apiKey?: string,
  baseUrl?: string,
): Promise<ContentGeneratorConfig> {
  const effectiveApiKey =
    apiKey ||
    process.env['A_CODER_API_KEY'] ||
    process.env['OPENAI_API_KEY'] ||
    'ollama';
  const effectiveModel =
    model ||
    process.env['A_CODER_MODEL'] ||
    process.env['OPENAI_MODEL'] ||
    'qwen3:14b';

  return {
    model: effectiveModel,
    apiKey: effectiveApiKey,
    authType,
    baseUrl: baseUrl || process.env['A_CODER_BASE_URL'] || process.env['OPENAI_BASE_URL'],
  };
}

export async function createContentGenerator(
  config: ContentGeneratorConfig,
  gcConfig: Config,
  _sessionId?: string,
): Promise<ContentGenerator> {
  if (gcConfig.fakeResponsesNonStrict) {
    const fakeGenerator = await FakeContentGenerator.fromFile(
      gcConfig.fakeResponsesNonStrict,
      { nonStrict: true },
    );
    return new LoggingContentGenerator(fakeGenerator, gcConfig);
  }
  if (gcConfig.fakeResponses) {
    const fakeGenerator = await FakeContentGenerator.fromFile(
      gcConfig.fakeResponses,
    );
    return new LoggingContentGenerator(fakeGenerator, gcConfig);
  }

  const generator = new OpenAIContentGenerator(
    config.apiKey || 'ollama',
    config.model ||
      process.env['A_CODER_MODEL'] ||
      process.env['OPENAI_MODEL'] ||
      'qwen3:14b',
    config.baseUrl,
  );

  let wrapped: ContentGenerator = new ModelMappingContentGenerator(
    generator,
    CCPA_AI_MODEL_MAPPINGS,
  );
  wrapped = new LoggingContentGenerator(wrapped, gcConfig);

  if (gcConfig.recordResponses) {
    return new RecordingContentGenerator(wrapped, gcConfig.recordResponses);
  }

  return wrapped;
}
