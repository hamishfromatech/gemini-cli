/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createContentGenerator,
  AuthType,
  createContentGeneratorConfig,
  getAuthTypeFromEnv,
  type ContentGenerator,
} from './contentGenerator.js';
import type { Config } from '../config/config.js';
import { LoggingContentGenerator } from './loggingContentGenerator.js';
import { ModelMappingContentGenerator } from './modelMappingContentGenerator.js';
import { RecordingContentGenerator } from './recordingContentGenerator.js';
import { FakeContentGenerator } from './fakeContentGenerator.js';
import { OpenAIContentGenerator } from './openaiContentGenerator.js';

const mockOpenAI = vi.hoisted(() => ({
  constructorCalls: [] as Array<{ apiKey: string; baseURL: string }>,
  chatCompletionsCreate: vi.fn(),
  embeddingsCreate: vi.fn(),
}));

vi.mock('openai', () => ({
  default: class MockOpenAI {
    chat = {
      completions: {
        create: mockOpenAI.chatCompletionsCreate,
      },
    };
    embeddings = {
      create: mockOpenAI.embeddingsCreate,
    };

    baseURL: string;

    constructor(config: { apiKey: string; baseURL: string }) {
      this.baseURL = config.baseURL;
      mockOpenAI.constructorCalls.push(config);
    }
  },
}));

vi.mock('./fakeContentGenerator.js');

function createMockConfig(overrides: Partial<Config> = {}): Config {
  return {
    getModel: vi.fn().mockReturnValue('gemini-pro'),
    getProxy: vi.fn().mockReturnValue(undefined),
    getUsageStatisticsEnabled: vi.fn().mockReturnValue(true),
    getClientName: vi.fn().mockReturnValue(undefined),
    getTelemetryLogPromptsEnabled: vi.fn().mockReturnValue(true),
    getTelemetryTracesEnabled: vi.fn().mockReturnValue(true),
    getSessionId: vi.fn().mockReturnValue('test-session-id'),
    refreshUserQuotaIfStale: vi.fn().mockResolvedValue(undefined),
    setLatestApiRequest: vi.fn(),
    getContentGeneratorConfig: vi.fn().mockReturnValue({}),
    isInteractive: vi.fn().mockReturnValue(false),
    getExperiments: vi.fn().mockReturnValue(undefined),
    ...overrides,
  } as unknown as Config;
}

describe('getAuthTypeFromEnv', () => {
  beforeEach(() => {
    vi.stubEnv('A_CODER_API_KEY', undefined);
    vi.stubEnv('OPENAI_API_KEY', undefined);
    vi.stubEnv('A_CODER_BASE_URL', undefined);
    vi.stubEnv('OPENAI_BASE_URL', undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return USE_OPENAI when A_CODER_API_KEY is set', () => {
    vi.stubEnv('A_CODER_API_KEY', 'test-key');
    expect(getAuthTypeFromEnv()).toBe(AuthType.USE_OPENAI);
  });

  it('should return USE_OPENAI when OPENAI_API_KEY is set', () => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
    expect(getAuthTypeFromEnv()).toBe(AuthType.USE_OPENAI);
  });

  it('should return USE_OPENAI_COMPATIBLE when A_CODER_BASE_URL is set', () => {
    vi.stubEnv('A_CODER_BASE_URL', 'https://api.example.com/v1');
    expect(getAuthTypeFromEnv()).toBe(AuthType.USE_OPENAI_COMPATIBLE);
  });

  it('should return USE_OPENAI_COMPATIBLE when OPENAI_BASE_URL is set', () => {
    vi.stubEnv('OPENAI_BASE_URL', 'https://api.example.com/v1');
    expect(getAuthTypeFromEnv()).toBe(AuthType.USE_OPENAI_COMPATIBLE);
  });

  it('should prefer USE_OPENAI over USE_OPENAI_COMPATIBLE when both API key and base URL are set', () => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
    vi.stubEnv('OPENAI_BASE_URL', 'https://api.example.com/v1');
    expect(getAuthTypeFromEnv()).toBe(AuthType.USE_OPENAI);
  });

  it('should return undefined when no matching env variables are set', () => {
    expect(getAuthTypeFromEnv()).toBeUndefined();
  });
});

describe('createContentGeneratorConfig', () => {
  beforeEach(() => {
    vi.stubEnv('A_CODER_API_KEY', undefined);
    vi.stubEnv('OPENAI_API_KEY', undefined);
    vi.stubEnv('A_CODER_MODEL', undefined);
    vi.stubEnv('OPENAI_MODEL', undefined);
    vi.stubEnv('A_CODER_BASE_URL', undefined);
    vi.stubEnv('OPENAI_BASE_URL', undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should use ollama/qwen3:14b defaults when nothing is provided', async () => {
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI,
    );
    expect(config).toEqual({
      model: 'qwen3:14b',
      apiKey: 'ollama',
      authType: AuthType.USE_OPENAI,
      baseUrl: undefined,
    });
  });

  it('should use A_CODER_API_KEY for apiKey', async () => {
    vi.stubEnv('A_CODER_API_KEY', 'a-coder-key');
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI,
    );
    expect(config.apiKey).toBe('a-coder-key');
  });

  it('should use OPENAI_API_KEY for apiKey', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'openai-key');
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI,
    );
    expect(config.apiKey).toBe('openai-key');
  });

  it('should prefer A_CODER_API_KEY over OPENAI_API_KEY', async () => {
    vi.stubEnv('A_CODER_API_KEY', 'a-coder-key');
    vi.stubEnv('OPENAI_API_KEY', 'openai-key');
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI,
    );
    expect(config.apiKey).toBe('a-coder-key');
  });

  it('should use A_CODER_MODEL for model', async () => {
    vi.stubEnv('A_CODER_MODEL', 'a-coder-model');
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI,
    );
    expect(config.model).toBe('a-coder-model');
  });

  it('should use OPENAI_MODEL for model', async () => {
    vi.stubEnv('OPENAI_MODEL', 'openai-model');
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI,
    );
    expect(config.model).toBe('openai-model');
  });

  it('should prefer A_CODER_MODEL over OPENAI_MODEL', async () => {
    vi.stubEnv('A_CODER_MODEL', 'a-coder-model');
    vi.stubEnv('OPENAI_MODEL', 'openai-model');
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI,
    );
    expect(config.model).toBe('a-coder-model');
  });

  it('should use A_CODER_BASE_URL for baseUrl', async () => {
    vi.stubEnv('A_CODER_BASE_URL', 'https://a-coder.example.com/v1');
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI_COMPATIBLE,
    );
    expect(config.baseUrl).toBe('https://a-coder.example.com/v1');
  });

  it('should use OPENAI_BASE_URL for baseUrl', async () => {
    vi.stubEnv('OPENAI_BASE_URL', 'https://openai.example.com/v1');
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI_COMPATIBLE,
    );
    expect(config.baseUrl).toBe('https://openai.example.com/v1');
  });

  it('should prefer A_CODER_BASE_URL over OPENAI_BASE_URL', async () => {
    vi.stubEnv('A_CODER_BASE_URL', 'https://a-coder.example.com/v1');
    vi.stubEnv('OPENAI_BASE_URL', 'https://openai.example.com/v1');
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI_COMPATIBLE,
    );
    expect(config.baseUrl).toBe('https://a-coder.example.com/v1');
  });

  it('should use explicit apiKey over environment variables', async () => {
    vi.stubEnv('A_CODER_API_KEY', 'env-key');
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI,
      'explicit-key',
    );
    expect(config.apiKey).toBe('explicit-key');
  });

  it('should default to ollama placeholder for default Ollama base URL without API key', async () => {
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI_COMPATIBLE,
      undefined,
      'http://localhost:11434/v1',
    );
    expect(config.apiKey).toBe('ollama');
  });

  it('should default to ollama placeholder for 127.0.0.1:11434 without API key', async () => {
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI_COMPATIBLE,
      undefined,
      'http://127.0.0.1:11434',
    );
    expect(config.apiKey).toBe('ollama');
  });

  it('should not default to ollama placeholder for custom base URL without API key', async () => {
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI_COMPATIBLE,
      undefined,
      'https://api.example.com/v1',
    );
    expect(config.apiKey).toBe('');
  });

  it('should preserve explicitly empty apiKey for custom base URL', async () => {
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI_COMPATIBLE,
      '',
      'https://api.example.com/v1',
    );
    expect(config.apiKey).toBe('');
  });

  it('should use explicit model over environment variables', async () => {
    vi.stubEnv('A_CODER_MODEL', 'env-model');
    const config = await createContentGeneratorConfig(
      'explicit-model',
      AuthType.USE_OPENAI,
    );
    expect(config.model).toBe('explicit-model');
  });

  it('should use explicit baseUrl over environment variables', async () => {
    vi.stubEnv('A_CODER_BASE_URL', 'https://env.example.com/v1');
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI_COMPATIBLE,
      undefined,
      'https://explicit.example.com/v1',
    );
    expect(config.baseUrl).toBe('https://explicit.example.com/v1');
  });

  it('should pass through the provided authType', async () => {
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI_COMPATIBLE,
    );
    expect(config.authType).toBe(AuthType.USE_OPENAI_COMPATIBLE);
  });
});

describe('createContentGenerator', () => {
  beforeEach(() => {
    mockOpenAI.constructorCalls.length = 0;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should create a FakeContentGenerator when fakeResponses is set', async () => {
    const mockGenerator = {} as unknown as ContentGenerator;
    vi.mocked(FakeContentGenerator.fromFile).mockResolvedValue(
      mockGenerator as never,
    );
    const fakeResponsesFile = 'fake/responses.yaml';
    const mockConfigWithFake = createMockConfig({
      fakeResponses: fakeResponsesFile,
    });
    const generator = await createContentGenerator(
      { authType: AuthType.USE_OPENAI },
      mockConfigWithFake,
    );
    expect(FakeContentGenerator.fromFile).toHaveBeenCalledWith(
      fakeResponsesFile,
    );
    expect(generator).toEqual(
      new LoggingContentGenerator(mockGenerator, mockConfigWithFake),
    );
  });

  it('should create a non-strict FakeContentGenerator when fakeResponsesNonStrict is set', async () => {
    const mockGenerator = {} as unknown as ContentGenerator;
    vi.mocked(FakeContentGenerator.fromFile).mockResolvedValue(
      mockGenerator as never,
    );
    const fakeResponsesFile = 'fake/responses.yaml';
    const mockConfigWithFakeNonStrict = createMockConfig({
      fakeResponsesNonStrict: fakeResponsesFile,
    });
    const generator = await createContentGenerator(
      { authType: AuthType.USE_OPENAI },
      mockConfigWithFakeNonStrict,
    );
    expect(FakeContentGenerator.fromFile).toHaveBeenCalledWith(
      fakeResponsesFile,
      { nonStrict: true },
    );
    expect(generator).toEqual(
      new LoggingContentGenerator(mockGenerator, mockConfigWithFakeNonStrict),
    );
  });

  it('should create a RecordingContentGenerator when recordResponses is set', async () => {
    const recordResponsesFile = 'record/responses.yaml';
    const mockConfigWithRecordResponses = createMockConfig({
      recordResponses: recordResponsesFile,
    });
    const generator = await createContentGenerator(
      { authType: AuthType.USE_OPENAI },
      mockConfigWithRecordResponses,
    );
    expect(generator).toBeInstanceOf(RecordingContentGenerator);
  });

  it('should create an OpenAIContentGenerator-based chain by default', async () => {
    const config = createMockConfig();
    const generator = await createContentGenerator(
      {
        authType: AuthType.USE_OPENAI,
        apiKey: 'test-key',
        model: 'test-model',
      },
      config,
    );

    expect(generator).toBeInstanceOf(LoggingContentGenerator);
    expect((generator as LoggingContentGenerator).getWrapped()).toBeInstanceOf(
      ModelMappingContentGenerator,
    );
    const modelMapping = (
      generator as LoggingContentGenerator
    ).getWrapped() as ModelMappingContentGenerator;
    expect(modelMapping.getWrapped()).toBeInstanceOf(OpenAIContentGenerator);

    expect(mockOpenAI.constructorCalls).toHaveLength(1);
    expect(mockOpenAI.constructorCalls[0]).toMatchObject({
      apiKey: 'test-key',
      baseURL: 'http://localhost:11434/v1',
    });
  });

  it('should pass baseUrl from config to OpenAIContentGenerator', async () => {
    await createContentGenerator(
      {
        authType: AuthType.USE_OPENAI_COMPATIBLE,
        apiKey: 'test-key',
        model: 'test-model',
        baseUrl: 'https://api.example.com/v1',
      },
      createMockConfig(),
    );
    expect(mockOpenAI.constructorCalls[0]).toMatchObject({
      baseURL: 'https://api.example.com/v1',
    });
  });

  it('should use environment baseUrl when no explicit baseUrl is provided', async () => {
    vi.stubEnv('OPENAI_BASE_URL', 'https://env.example.com/v1');
    const config = await createContentGeneratorConfig(
      undefined,
      AuthType.USE_OPENAI,
    );
    await createContentGenerator(config, createMockConfig());
    expect(mockOpenAI.constructorCalls[0]).toMatchObject({
      baseURL: 'https://env.example.com/v1',
    });
  });

  it('should not apply model mapping for fake responses', async () => {
    const mockInnerGenerator = {
      generateContent: vi.fn().mockResolvedValue({}),
    } as unknown as ContentGenerator;
    vi.mocked(FakeContentGenerator.fromFile).mockResolvedValue(
      mockInnerGenerator as never,
    );

    const generator = await createContentGenerator(
      { authType: AuthType.USE_OPENAI },
      createMockConfig({ fakeResponses: 'fake.yaml' }),
    );

    await generator.generateContent(
      { model: 'gemini-3.5-flash', contents: [] },
      'prompt-id',
      'user',
    );

    expect(mockInnerGenerator.generateContent).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gemini-3.5-flash' }),
      'prompt-id',
      'user',
    );
  });

  it('should not use Google-specific auth types in normal operation', async () => {
    const googleAuthTypes = [
      AuthType.LOGIN_WITH_GOOGLE,
      AuthType.USE_GEMINI,
      AuthType.USE_VERTEX_AI,
      AuthType.COMPUTE_ADC,
      AuthType.GATEWAY,
      AuthType.LEGACY_CLOUD_SHELL,
    ];

    for (const authType of googleAuthTypes) {
      const generator = await createContentGenerator(
        { authType, apiKey: 'test-key', model: 'test-model' },
        createMockConfig(),
      );
      expect(generator).toBeInstanceOf(LoggingContentGenerator);
      const modelMapping = (
        generator as LoggingContentGenerator
      ).getWrapped() as ModelMappingContentGenerator;
      expect(modelMapping.getWrapped()).toBeInstanceOf(OpenAIContentGenerator);
    }
  });
});
