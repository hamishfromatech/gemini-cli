/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type { HttpHeaders } from '@a2a-js/sdk/client';
import type { AgentCard } from '@a2a-js/sdk';
import { BaseA2AAuthProvider } from './base-provider.js';
import type { OAuth2AuthConfig } from './types.js';

export class OAuth2AuthProvider extends BaseA2AAuthProvider {
  readonly type = 'oauth2' as const;

  constructor(
    private readonly config: OAuth2AuthConfig,
    private readonly agentName: string,
    _agentCard?: AgentCard,
    private readonly agentCardUrl?: string,
  ) {
    super();
  }

  override async initialize(): Promise<void> {
    // No-op: A-Coder CLI does not perform interactive OAuth flows.
  }

  async headers(): Promise<HttpHeaders> {
    return {};
  }
}
