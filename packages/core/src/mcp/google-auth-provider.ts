/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type { McpAuthProvider } from './auth-provider.js';
import type {
  OAuthClientInformationMixed,
  OAuthClientMetadata,
  OAuthTokens,
} from '@modelcontextprotocol/sdk/shared/auth.js';
import type { MCPServerConfig } from '../config/config.js';

export class GoogleCredentialProvider implements McpAuthProvider {
  readonly clientMetadata: OAuthClientMetadata = {
    client_name: 'A-Coder CLI',
    redirect_uris: [],
    grant_types: [],
    response_types: [],
    token_endpoint_auth_method: 'none',
  };

  constructor(private readonly _config?: MCPServerConfig) {}

  get redirectUrl(): string | URL | undefined {
    return undefined;
  }

  clientInformation(): OAuthClientInformationMixed | undefined {
    return undefined;
  }

  saveClientInformation(_clientInformation: OAuthClientInformationMixed): void {}

  async tokens(): Promise<OAuthTokens | undefined> {
    return undefined;
  }

  async saveTokens(_tokens: OAuthTokens): Promise<void> {}

  async redirectToAuthorization(_authorizationUrl: URL): Promise<void> {}

  async saveCodeVerifier(_codeVerifier: string): Promise<void> {}

  async codeVerifier(): Promise<string> {
    return '';
  }
}
