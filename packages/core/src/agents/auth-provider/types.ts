/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

/**
 * Client-side auth configuration for A2A remote agents.
 */

import type { AuthenticationHandler } from '@a2a-js/sdk/client';

export type A2AAuthProviderType =
  | 'google-credentials'
  | 'apiKey'
  | 'http'
  | 'oauth2'
  | 'openIdConnect';

export interface A2AAuthProvider extends AuthenticationHandler {
  readonly type: A2AAuthProviderType;
  initialize?(): Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BaseAuthConfig {}

export interface GoogleCredentialsAuthConfig extends BaseAuthConfig {
  type: 'google-credentials';
  scopes?: string[];
}

export interface ApiKeyAuthConfig extends BaseAuthConfig {
  type: 'apiKey';
  key: string;
  name?: string;
}

export type HttpAuthConfig = BaseAuthConfig & {
  type: 'http';
} & (
    | {
        scheme: 'Bearer';
        token: string;
      }
    | {
        scheme: 'Basic';
        username: string;
        password: string;
      }
    | {
        scheme: string;
        value: string;
      }
  );

export interface OAuth2AuthConfig extends BaseAuthConfig {
  type: 'oauth2';
  client_id?: string;
  client_secret?: string;
  scopes?: string[];
  authorization_url?: string;
  token_url?: string;
  issuer?: string;
  audiences?: string[];
  redirect_uri?: string;
  token_param_name?: string;
  registration_url?: string;
}

export interface OpenIdConnectAuthConfig extends BaseAuthConfig {
  type: 'openIdConnect';
  issuer_url: string;
  client_id: string;
  client_secret?: string;
  target_audience?: string;
  scopes?: string[];
}

export type A2AAuthConfig =
  | GoogleCredentialsAuthConfig
  | ApiKeyAuthConfig
  | HttpAuthConfig
  | OAuth2AuthConfig
  | OpenIdConnectAuthConfig;

export interface AuthConfigDiff {
  requiredSchemes: string[];
  configuredType?: A2AAuthProviderType;
  missingConfig: string[];
}

export interface AuthValidationResult {
  valid: boolean;
  diff?: AuthConfigDiff;
}
