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
  GenerateContentResponse,
  type GenerateContentParameters,
  type Part,
  type Tool,
  type ToolListUnion,
  type CallableTool,
  type FunctionCall,
  type FunctionResponse,
  FinishReason,
} from '@google/genai';
import OpenAI from 'openai';
import type {
  ChatCompletion,
  ChatCompletionChunk,
} from 'openai/resources/chat/index.js';
import type { ContentGenerator } from './contentGenerator.js';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  reasoning_content?: string | null;
  tool_calls?: OpenAIToolCall[];
  tool_call_id?: string;
}

interface OpenAIToolCall {
  id: string;
  type: 'function';
  index?: number;
  function: {
    name: string;
    arguments: string;
  };
}

function robustParseToolArguments(args: string): Record<string, unknown> {
  try {
    return JSON.parse(args) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function mapFinishReason(openaiReason: string | null): FinishReason {
  if (!openaiReason) return FinishReason.FINISH_REASON_UNSPECIFIED;
  switch (openaiReason) {
    case 'stop':
      return FinishReason.STOP;
    case 'length':
      return FinishReason.MAX_TOKENS;
    case 'content_filter':
      return FinishReason.SAFETY;
    case 'function_call':
    case 'tool_calls':
      return FinishReason.STOP;
    default:
      return FinishReason.FINISH_REASON_UNSPECIFIED;
  }
}

export class OpenAIContentGenerator implements ContentGenerator {
  private client: OpenAI;
  private model: string;
  private streamingToolCalls = new Map<
    number,
    { id?: string; name?: string; arguments: string }
  >();

  constructor(
    apiKey: string,
    model: string,
    baseURL =
      process.env['OPENAI_BASE_URL'] ||
      process.env['A_CODER_BASE_URL'] ||
      'http://localhost:11434/v1',
  ) {
    this.model = model;
    const timeout = Number(process.env['A_CODER_REQUEST_TIMEOUT'] ?? '1000000');
    const maxRetries = Number(process.env['A_CODER_MAX_RETRIES'] ?? '3');

    this.client = new OpenAI({
      apiKey,
      baseURL,
      timeout,
      maxRetries,
      defaultHeaders: baseURL.includes('openrouter.ai')
        ? {
            'HTTP-Referer': 'https://github.com/hamishfromatech/a-coder-cli',
            'X-Title': 'A-Coder CLI',
          }
        : undefined,
    });
  }

  async generateContent(
    request: GenerateContentParameters,
  ): Promise<GenerateContentResponse> {
    const messages = this.convertToOpenAIFormat(request);
    const createParams: any = {
      model: this.model,
      messages,
      temperature: request.config?.temperature ?? 0.0,
      top_p: request.config?.topP ?? 1.0,
      ...(request.config?.maxOutputTokens !== undefined
        ? { max_tokens: request.config.maxOutputTokens }
        : {}),
    };

    if (this.client.baseURL.includes('openrouter.ai')) {
      createParams.include_reasoning = true;
    }

    if (request.config?.responseMimeType === 'application/json') {
      createParams.response_format = { type: 'text' };
    }

    if (request.config?.tools) {
      createParams.tools = await this.convertGeminiToolsToOpenAI(
        request.config.tools,
      );
    }

    const completion = (await this.client.chat.completions.create(
      createParams,
    )) as ChatCompletion;
    return this.convertToGeminiFormat(completion);
  }

  async generateContentStream(
    request: GenerateContentParameters,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    const messages = this.convertToOpenAIFormat(request);
    const createParams: any = {
      model: this.model,
      messages,
      temperature: request.config?.temperature ?? 0.0,
      top_p: request.config?.topP ?? 1.0,
      ...(request.config?.maxOutputTokens !== undefined
        ? { max_tokens: request.config.maxOutputTokens }
        : {}),
      stream: true,
    };

    if (this.client.baseURL.includes('openrouter.ai')) {
      createParams.include_reasoning = true;
    }

    if (request.config?.responseMimeType === 'application/json') {
      createParams.response_format = { type: 'text' };
    }

    if (request.config?.tools) {
      createParams.tools = await this.convertGeminiToolsToOpenAI(
        request.config.tools,
      );
    }

    const stream = (await this.client.chat.completions.create(
      createParams,
    )) as unknown as AsyncIterable<ChatCompletionChunk>;
    return this.streamGenerator(stream);
  }

  private async *streamGenerator(
    stream: AsyncIterable<ChatCompletionChunk>,
  ): AsyncGenerator<GenerateContentResponse> {
    this.streamingToolCalls.clear();

    for await (const chunk of stream) {
      yield this.convertStreamChunkToGeminiFormat(chunk);
    }
  }

  async countTokens(
    request: CountTokensParameters,
  ): Promise<CountTokensResponse> {
    const content = JSON.stringify(request.contents);
    const estimatedTokens = Math.ceil(content.length / 4);
    return { totalTokens: estimatedTokens };
  }

  async embedContent(
    request: EmbedContentParameters,
  ): Promise<EmbedContentResponse> {
    let text = '';
    if (Array.isArray(request.contents)) {
      text = request.contents
        .map((content) => {
          if (typeof content === 'string') return content;
          if ('parts' in content && content.parts) {
            return content.parts
              .map((part) =>
                typeof part === 'string'
                  ? part
                  : 'text' in part
                    ? (part as { text?: string }).text || ''
                    : '',
              )
              .join(' ');
          }
          return '';
        })
        .join(' ');
    }

    const embedding = await this.client.embeddings.create({
      model: this.model.includes('embed')
        ? this.model
        : 'text-embedding-ada-002',
      input: text,
    });

    return {
      embeddings: [{ values: embedding.data[0].embedding }],
    };
  }

  private async convertGeminiToolsToOpenAI(
    geminiTools: ToolListUnion,
  ): Promise<OpenAI.Chat.ChatCompletionTool[]> {
    const openAITools: OpenAI.Chat.ChatCompletionTool[] = [];

    for (const tool of geminiTools) {
      let actualTool: Tool;
      if ('tool' in tool) {
        actualTool = await (tool).tool();
      } else {
        actualTool = tool;
      }

      if (actualTool.functionDeclarations) {
        for (const func of actualTool.functionDeclarations) {
          if (func.name && func.description) {
            openAITools.push({
              type: 'function',
              function: {
                name: func.name,
                description: func.description,
                parameters: (func.parameters || {}) as Record<string, unknown>,
              },
            });
          }
        }
      }
    }

    return openAITools;
  }

  private convertToOpenAIFormat(
    request: GenerateContentParameters,
  ): OpenAI.Chat.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (request.config?.systemInstruction) {
      const systemInstruction = request.config.systemInstruction;
      let systemText = '';

      if (Array.isArray(systemInstruction)) {
        systemText = systemInstruction
          .map((content) => {
            if (typeof content === 'string') return content;
            const contentWithParts = content as { parts?: Part[] };
            if (contentWithParts.parts) {
              return (
                contentWithParts.parts
                  .map((p: Part) =>
                    typeof p === 'string' ? p : 'text' in p ? p.text : '',
                  )
                  .join('\n') || ''
              );
            }
            return '';
          })
          .join('\n');
      } else if (typeof systemInstruction === 'string') {
        systemText = systemInstruction;
      } else if (
        typeof systemInstruction === 'object' &&
        'parts' in systemInstruction
      ) {
        systemText =
          systemInstruction.parts
            ?.map((p: Part) =>
              typeof p === 'string' ? p : 'text' in p ? p.text : '',
            )
            .join('\n') || '';
      }

      if (systemText) {
        messages.push({ role: 'system', content: systemText });
      }
    }

    const contents = Array.isArray(request.contents)
      ? request.contents
      : [request.contents];

    for (const content of contents) {
      if (typeof content === 'string') {
        messages.push({ role: 'user', content });
        continue;
      }
      if (!('role' in content) || !('parts' in content)) continue;

      const textParts: string[] = [];
      const functionCalls: FunctionCall[] = [];
      const functionResponses: FunctionResponse[] = [];

      for (const part of content.parts || []) {
        if (typeof part === 'string') {
          textParts.push(part);
        } else if ('text' in part && part.text) {
          textParts.push(part.text);
        } else if ('functionCall' in part && part.functionCall) {
          functionCalls.push(part.functionCall);
        } else if ('functionResponse' in part && part.functionResponse) {
          functionResponses.push(part.functionResponse);
        }
      }

      for (const funcResponse of functionResponses) {
        messages.push({
          role: 'tool',
          tool_call_id: funcResponse.id || '',
          content:
            typeof funcResponse.response === 'string'
              ? funcResponse.response
              : JSON.stringify(funcResponse.response),
        } as OpenAI.Chat.ChatCompletionMessageParam);
      }

      if (content.role === 'model' && functionCalls.length > 0) {
        const toolCalls = functionCalls.map((fc, index) => ({
          id: fc.id || `call_${index}`,
          type: 'function' as const,
          function: {
            name: fc.name || '',
            arguments: JSON.stringify(fc.args || {}),
          },
        }));
        messages.push({
          role: 'assistant',
          content: textParts.join('\n') || null,
          tool_calls: toolCalls,
        } as OpenAI.Chat.ChatCompletionMessageParam);
      } else if (textParts.length > 0) {
        const role =
          content.role === 'model'
            ? ('assistant' as const)
            : ('user' as const);
        messages.push({ role, content: textParts.join('\n') });
      }
    }

    return this.cleanOrphanedToolCalls(messages);
  }

  private cleanOrphanedToolCalls(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
  ): OpenAI.Chat.ChatCompletionMessageParam[] {
    const toolCallIds = new Set<string>();
    const toolResponseIds = new Set<string>();

    for (const message of messages) {
      if (
        message.role === 'assistant' &&
        'tool_calls' in message &&
        message.tool_calls
      ) {
        for (const tc of message.tool_calls) {
          if (tc.id) toolCallIds.add(tc.id);
        }
      } else if (
        message.role === 'tool' &&
        'tool_call_id' in message &&
        message.tool_call_id
      ) {
        toolResponseIds.add(message.tool_call_id);
      }
    }

    const cleaned: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    for (const message of messages) {
      if (
        message.role === 'assistant' &&
        'tool_calls' in message &&
        message.tool_calls
      ) {
        const valid = message.tool_calls.filter(
          (tc) => tc.id && toolResponseIds.has(tc.id),
        );
        if (valid.length > 0) {
          cleaned.push({
            ...message,
            tool_calls: valid,
          } as OpenAI.Chat.ChatCompletionMessageParam);
        } else if (
          typeof message.content === 'string' &&
          message.content.trim()
        ) {
          const { tool_calls: _, ...withoutToolCalls } = message;
          cleaned.push(withoutToolCalls);
        }
      } else if (
        message.role === 'tool' &&
        'tool_call_id' in message &&
        message.tool_call_id
      ) {
        if (toolCallIds.has(message.tool_call_id)) {
          cleaned.push(message);
        }
      } else {
        cleaned.push(message);
      }
    }

    return cleaned;
  }

  private convertToGeminiFormat(
    openaiResponse: ChatCompletion,
  ): GenerateContentResponse {
    const choice = openaiResponse.choices[0];
    const response = new GenerateContentResponse();
    const parts: Part[] = [];

    const message = choice?.message as OpenAIMessage;
    const reasoning =
      message?.reasoning_content ||
      (message as unknown as { reasoning?: string })?.reasoning;
    if (reasoning) {
      parts.push({ text: reasoning, thought: true });
    }

    if (choice?.message?.content) {
      parts.push({ text: choice.message.content });
    }

    if (choice?.message?.tool_calls) {
      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.type === 'function') {
          parts.push({
            functionCall: {
              id: toolCall.id,
              name: toolCall.function.name,
              args: robustParseToolArguments(toolCall.function.arguments || '{}'),
            } as FunctionCall,
          });
        }
      }
    }

    response.candidates = [
      {
        content: { parts, role: 'model' },
        finishReason: mapFinishReason(choice?.finish_reason || 'stop'),
        index: 0,
        safetyRatings: [],
      },
    ];

    response.modelVersion = this.model;
    response.promptFeedback = { safetyRatings: [] };

    if (openaiResponse.usage) {
      response.usageMetadata = {
        promptTokenCount: openaiResponse.usage.prompt_tokens,
        candidatesTokenCount: openaiResponse.usage.completion_tokens,
        totalTokenCount: openaiResponse.usage.total_tokens,
      };
    }

    return response;
  }

  private convertStreamChunkToGeminiFormat(
    chunk: ChatCompletionChunk,
  ): GenerateContentResponse {
    const choice = chunk.choices?.[0];
    const response = new GenerateContentResponse();
    const parts: Part[] = [];

    if (choice) {
      const delta = choice.delta as {
        content?: string;
        reasoning_content?: string;
        reasoning?: string;
        tool_calls?: OpenAIToolCall[];
      };

      if (delta.reasoning_content || delta.reasoning) {
        const reasoning = delta.reasoning_content || delta.reasoning;
        parts.push({ text: reasoning, thought: true });
      }

      if (delta.content) {
        parts.push({ text: delta.content });
      }

      if (delta.tool_calls) {
        for (const toolCall of delta.tool_calls) {
          const index = toolCall.index ?? 0;
          let accumulated = this.streamingToolCalls.get(index);
          if (!accumulated) {
            accumulated = { arguments: '' };
            this.streamingToolCalls.set(index, accumulated);
          }
          if (toolCall.id) accumulated.id = toolCall.id;
          if (toolCall.function?.name) accumulated.name = toolCall.function.name;
          if (toolCall.function?.arguments) {
            accumulated.arguments += toolCall.function.arguments;
          }
        }
      }

      if (choice.finish_reason) {
        for (const [, accumulated] of this.streamingToolCalls) {
          if (accumulated.name) {
            parts.push({
              functionCall: {
                id: accumulated.id,
                name: accumulated.name,
                args: accumulated.arguments
                  ? robustParseToolArguments(accumulated.arguments)
                  : {},
              } as FunctionCall,
            });
          }
        }
        this.streamingToolCalls.clear();
      }

      response.candidates = [
        {
          content: { parts, role: 'model' },
          finishReason: choice.finish_reason
            ? mapFinishReason(choice.finish_reason)
            : FinishReason.FINISH_REASON_UNSPECIFIED,
          index: 0,
          safetyRatings: [],
        },
      ];
    } else {
      response.candidates = [];
    }

    response.modelVersion = this.model;
    response.promptFeedback = { safetyRatings: [] };

    if (chunk.usage) {
      response.usageMetadata = {
        promptTokenCount: chunk.usage.prompt_tokens ?? 0,
        candidatesTokenCount: chunk.usage.completion_tokens ?? 0,
        totalTokenCount: chunk.usage.total_tokens ?? 0,
      };
    }

    return response;
  }
}
