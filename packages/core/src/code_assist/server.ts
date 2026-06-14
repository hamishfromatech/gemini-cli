/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

type AuthClient = unknown;
import {
  UserTierId,
  type CodeAssistGlobalUserSettingResponse,
  type LoadCodeAssistRequest,
  type LoadCodeAssistResponse,
  type LongRunningOperationResponse,
  type OnboardUserRequest,
  type SetCodeAssistGlobalUserSettingRequest,
  type ClientMetadata,
  type RetrieveUserQuotaRequest,
  type RetrieveUserQuotaResponse,
  type FetchAdminControlsRequest,
  type FetchAdminControlsResponse,
  type ConversationOffered,
  type ConversationInteraction,
  type RecordCodeAssistMetricsRequest,
  type GeminiUserTier,
} from './types.js';
import type { ListExperimentsResponse } from './experiments/types.js';
import type {
  CountTokensParameters,
  CountTokensResponse,
  EmbedContentParameters,
  EmbedContentResponse,
  GenerateContentParameters,
  GenerateContentResponse,
} from '@google/genai';
import type { ContentGenerator } from '../core/contentGenerator.js';
import type { Config } from '../config/config.js';
import type { LlmRole } from '../telemetry/types.js';

/** HTTP options to be used in each of the requests. */
export interface HttpOptions {
  /** Additional HTTP headers to be sent with the request. */
  headers?: Record<string, string>;
}

export const CODE_ASSIST_ENDPOINT = '';
export const CODE_ASSIST_API_VERSION = '';

export class CodeAssistServer implements ContentGenerator {
  constructor(
    readonly client: AuthClient,
    readonly projectId?: string,
    readonly httpOptions: HttpOptions = {},
    readonly sessionId?: string,
    readonly userTier?: UserTierId,
    readonly userTierName?: string,
    readonly paidTier?: GeminiUserTier,
    readonly config?: Config,
  ) {}

  async generateContentStream(
     
    _req: GenerateContentParameters,
     
    _userPromptId: string,
     
    _role: LlmRole,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    return async function* () {
      // No-op: do not call Google endpoints in the stub.
    }();
  }

  async generateContent(
     
    _req: GenerateContentParameters,
     
    _userPromptId: string,
     
    _role: LlmRole,
  ): Promise<GenerateContentResponse> {
    return {} as GenerateContentResponse;
  }

  async onboardUser(
     
    _req: OnboardUserRequest,
  ): Promise<LongRunningOperationResponse> {
    return {} as LongRunningOperationResponse;
  }

  async getOperation(
     
    _name: string,
  ): Promise<LongRunningOperationResponse> {
    return {} as LongRunningOperationResponse;
  }

  async loadCodeAssist(
     
    _req: LoadCodeAssistRequest,
  ): Promise<LoadCodeAssistResponse> {
    return {
      currentTier: { id: UserTierId.STANDARD },
    } as LoadCodeAssistResponse;
  }

  async refreshAvailableCredits(): Promise<void> {
    // No-op: do not call Google endpoints in the stub.
  }

  async fetchAdminControls(
     
    _req: FetchAdminControlsRequest,
  ): Promise<FetchAdminControlsResponse> {
    return {} as FetchAdminControlsResponse;
  }

  async getCodeAssistGlobalUserSetting(): Promise<CodeAssistGlobalUserSettingResponse> {
    return {} as CodeAssistGlobalUserSettingResponse;
  }

  async setCodeAssistGlobalUserSetting(
     
    _req: SetCodeAssistGlobalUserSettingRequest,
  ): Promise<CodeAssistGlobalUserSettingResponse> {
    return {} as CodeAssistGlobalUserSettingResponse;
  }

  async countTokens(
     
    _req: CountTokensParameters,
  ): Promise<CountTokensResponse> {
    return { totalTokens: 0 } as CountTokensResponse;
  }

  async embedContent(
     
    _req: EmbedContentParameters,
  ): Promise<EmbedContentResponse> {
    return {} as EmbedContentResponse;
  }

  async listExperiments(
     
    _metadata: ClientMetadata,
  ): Promise<ListExperimentsResponse> {
    return {} as ListExperimentsResponse;
  }

  async retrieveUserQuota(
     
    _req: RetrieveUserQuotaRequest,
  ): Promise<RetrieveUserQuotaResponse> {
    return {} as RetrieveUserQuotaResponse;
  }

  async recordConversationOffered(
     
    _conversationOffered: ConversationOffered,
  ): Promise<void> {
    // No-op: do not send telemetry to Google endpoints in the stub.
  }

  async recordConversationInteraction(
     
    _interaction: ConversationInteraction,
  ): Promise<void> {
    // No-op: do not send telemetry to Google endpoints in the stub.
  }

  async recordCodeAssistMetrics(
     
    _request: RecordCodeAssistMetricsRequest,
  ): Promise<void> {
    // No-op: do not send telemetry to Google endpoints in the stub.
  }

  async requestPost<T>(
     
    _method: string,
     
    _req: object,
     
    _signal?: AbortSignal,
     
    _retryDelay?: number,
  ): Promise<T> {
    return {} as T;
  }

  async requestGet<T>(
     
    _method: string,
     
    _signal?: AbortSignal,
  ): Promise<T> {
    return {} as T;
  }

  async requestGetOperation<T>(
     
    _name: string,
     
    _signal?: AbortSignal,
  ): Promise<T> {
    return {} as T;
  }

  async requestStreamingPost<T>(
     
    _method: string,
     
    _req: object,
     
    _signal?: AbortSignal,
  ): Promise<AsyncGenerator<T>> {
    return async function* () {
      // No-op: do not call Google endpoints in the stub.
    }();
  }

  getMethodUrl(
     
    _method: string,
  ): string {
    return '';
  }

  getOperationUrl(
     
    _name: string,
  ): string {
    return '';
  }
}
