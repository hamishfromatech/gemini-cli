/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type {
  CountTokensParameters,
  CountTokensResponse,
  EmbedContentParameters,
  EmbedContentResponse,
  GenerateContentParameters,
  GenerateContentResponse,
} from '@google/genai';
import type { LlmRole } from '../telemetry/llmRole.js';
import type { Config } from '../config/config.js';
import type { ContentGenerator } from './contentGenerator.js';

export interface ContextBreakdown {
  system_instructions: number;
  tool_definitions: number;
  history: number;
  tool_calls: Record<string, number>;
  mcp_servers: number;
}

export function estimateContextBreakdown(
  _contents: unknown[],
  _config?: unknown,
): ContextBreakdown {
  return {
    system_instructions: 0,
    tool_definitions: 0,
    history: 0,
    tool_calls: {},
    mcp_servers: 0,
  };
}

export class LoggingContentGenerator implements ContentGenerator {
  constructor(
    private readonly wrapped: ContentGenerator,
    private readonly _config: Config,
  ) {}

  getWrapped(): ContentGenerator {
    return this.wrapped;
  }

  async generateContent(
    request: GenerateContentParameters,
    userPromptId: string,
    role: LlmRole,
  ): Promise<GenerateContentResponse> {
    return this.wrapped.generateContent(request, userPromptId, role);
  }

  async generateContentStream(
    request: GenerateContentParameters,
    userPromptId: string,
    role: LlmRole,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    return this.wrapped.generateContentStream(request, userPromptId, role);
  }

  async countTokens(request: CountTokensParameters): Promise<CountTokensResponse> {
    return this.wrapped.countTokens(request);
  }

  async embedContent(
    request: EmbedContentParameters,
  ): Promise<EmbedContentResponse> {
    return this.wrapped.embedContent(request);
  }
}
