/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import { WebSearchTool, type WebSearchToolParams } from './web-search.js';
import type { Config } from '../config/config.js';
import { ACoderClient } from '../core/a-coder-client.js';
import { ToolErrorType } from './tool-error.js';
import { createMockMessageBus } from '../test-utils/mock-message-bus.js';

// Mock ACoderClient and Config constructor
vi.mock('../core/a-coder-client.js');
vi.mock('../config/config.js');

describe('WebSearchTool', () => {
  const abortSignal = new AbortController().signal;
  let mockACoderClient: ACoderClient;
  let tool: WebSearchTool;

  beforeEach(() => {
    const mockConfigInstance = {
      getACoderClient: () => mockACoderClient,
      get aCoderClient() {
        return mockACoderClient;
      },
      getProxy: () => undefined,
      generationConfigService: {
        getResolvedConfig: vi.fn().mockImplementation(({ model }) => ({
          model,
          sdkConfig: {},
        })),
      },
    } as unknown as Config;
    (
      mockConfigInstance as unknown as { config: Config; promptId: string }
    ).config = mockConfigInstance;
    (
      mockConfigInstance as unknown as { config: Config; promptId: string }
    ).promptId = 'test-prompt-id';
    mockACoderClient = new ACoderClient(mockConfigInstance);
    tool = new WebSearchTool(mockConfigInstance, createMockMessageBus());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('build', () => {
    it('should return an invocation for a valid query', () => {
      const params: WebSearchToolParams = { query: 'test query' };
      const invocation = tool.build(params);
      expect(invocation).toBeDefined();
      expect(invocation.params).toEqual(params);
    });

    it('should throw an error for an empty query', () => {
      const params: WebSearchToolParams = { query: '' };
      expect(() => tool.build(params)).toThrow(
        "The 'query' parameter cannot be empty.",
      );
    });

    it('should throw an error for a query with only whitespace', () => {
      const params: WebSearchToolParams = { query: '   ' };
      expect(() => tool.build(params)).toThrow(
        "The 'query' parameter cannot be empty.",
      );
    });
  });

  describe('getDescription', () => {
    it('should return a description of the search', () => {
      const params: WebSearchToolParams = { query: 'test query' };
      const invocation = tool.build(params);
      expect(invocation.getDescription()).toBe(
        'Searching the web for: "test query"',
      );
    });
  });

  describe('execute', () => {
    it('should return search results for a successful query', async () => {
      const params: WebSearchToolParams = { query: 'successful query' };
      (mockACoderClient.generateContent as Mock).mockResolvedValue({
        candidates: [
          {
            content: {
              role: 'model',
              parts: [{ text: 'Here are your results.' }],
            },
          },
        ],
      });

      const invocation = tool.build(params);
      const result = await invocation.execute({ abortSignal });

      expect(result.llmContent).toBe(
        'Web search results for "successful query":\n\nHere are your results.',
      );
      expect(result.returnDisplay).toBe(
        'Search results for "successful query" returned.',
      );
      expect(result.sources).toBeUndefined();
    });

    it('should handle no search results found', async () => {
      const params: WebSearchToolParams = { query: 'no results query' };
      (mockACoderClient.generateContent as Mock).mockResolvedValue({
        candidates: [
          {
            content: {
              role: 'model',
              parts: [{ text: '' }],
            },
          },
        ],
      });

      const invocation = tool.build(params);
      const result = await invocation.execute({ abortSignal });

      expect(result.llmContent).toBe(
        'No search results or information found for query: "no results query"',
      );
      expect(result.returnDisplay).toBe('No information found.');
    });

    it('should return a WEB_SEARCH_FAILED error on failure', async () => {
      const params: WebSearchToolParams = { query: 'error query' };
      const testError = new Error('API Failure');
      (mockACoderClient.generateContent as Mock).mockRejectedValue(testError);

      const invocation = tool.build(params);
      const result = await invocation.execute({ abortSignal });

      expect(result.error?.type).toBe(ToolErrorType.WEB_SEARCH_FAILED);
      expect(result.llmContent).toContain('Error:');
      expect(result.llmContent).toContain('API Failure');
      expect(result.returnDisplay).toBe('Error performing web search.');
    });

    it('should correctly format results with sources and citations', async () => {
      const params: WebSearchToolParams = { query: 'grounding query' };
      (mockACoderClient.generateContent as Mock).mockResolvedValue({
        candidates: [
          {
            content: {
              role: 'model',
              parts: [{ text: 'This is a test response.' }],
            },
            groundingMetadata: {
              groundingChunks: [
                { web: { uri: 'https://example.com', title: 'Example Site' } },
                { web: { uri: 'https://google.com', title: 'Google' } },
              ],
              groundingSupports: [
                {
                  segment: { startIndex: 5, endIndex: 14 },
                  groundingChunkIndices: [0],
                },
                {
                  segment: { startIndex: 15, endIndex: 24 },
                  groundingChunkIndices: [0, 1],
                },
              ],
            },
          },
        ],
      });

      const invocation = tool.build(params);
      const result = await invocation.execute({ abortSignal });

      const expectedLlmContent = `Web search results for "grounding query":

This is a test[1] response.[1][2]

Sources:
[1] Example Site (https://example.com)
[2] Google (https://google.com)`;

      expect(result.llmContent).toBe(expectedLlmContent);
      expect(result.returnDisplay).toBe(
        'Search results for "grounding query" returned.',
      );
      expect(result.sources).toHaveLength(2);
    });

    it('should insert markers at correct byte positions for multibyte text', async () => {
      const params: WebSearchToolParams = { query: 'multibyte query' };
      (mockACoderClient.generateContent as Mock).mockResolvedValue({
        candidates: [
          {
            content: {
              role: 'model',
              parts: [{ text: 'こんにちは! A-Coder CLI✨️' }],
            },
            groundingMetadata: {
              groundingChunks: [
                {
                  web: {
                    title: 'Japanese Greeting',
                    uri: 'https://example.test/japanese-greeting',
                  },
                },
                {
                  web: {
                    title: 'hamishfromatech/a-coder-cli',
                    uri: 'https://github.com/hamishfromatech/a-coder-cli',
                  },
                },
                {
                  web: {
                    title: 'A-Coder CLI: your open-source AI agent',
                    uri: 'https://blog.google/technology/developers/introducing-gemini-cli-open-source-ai-agent/',
                  },
                },
              ],
              groundingSupports: [
                {
                  segment: {
                    // Byte range of "こんにちは!" (utf-8 encoded)
                    startIndex: 0,
                    endIndex: 16,
                  },
                  groundingChunkIndices: [0],
                },
                {
                  segment: {
                    // Byte range of "A-Coder CLI✨️" (utf-8 encoded)
                    startIndex: 17,
                    endIndex: 33,
                  },
                  groundingChunkIndices: [1, 2],
                },
              ],
            },
          },
        ],
      });

      const invocation = tool.build(params);
      const result = await invocation.execute({ abortSignal });

      const expectedLlmContent = `Web search results for "multibyte query":

こんにちは![1] A-Coder CLI✨️[2][3]

Sources:
[1] Japanese Greeting (https://example.test/japanese-greeting)
[2] hamishfromatech/a-coder-cli (https://github.com/hamishfromatech/a-coder-cli)
[3] A-Coder CLI: your open-source AI agent (https://blog.google/technology/developers/introducing-gemini-cli-open-source-ai-agent/)`;

      expect(result.llmContent).toBe(expectedLlmContent);
      expect(result.returnDisplay).toBe(
        'Search results for "multibyte query" returned.',
      );
      expect(result.sources).toHaveLength(3);
    });
  });
});
