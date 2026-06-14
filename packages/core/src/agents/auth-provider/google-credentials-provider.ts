/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type { HttpHeaders } from '@a2a-js/sdk/client';
import { BaseA2AAuthProvider } from './base-provider.js';
import type { GoogleCredentialsAuthConfig } from './types.js';

export class GoogleCredentialsAuthProvider extends BaseA2AAuthProvider {
  readonly type = 'google-credentials' as const;

  constructor(
    private readonly config: GoogleCredentialsAuthConfig,
    _targetUrl?: string,
  ) {
    super();
  }

  override async initialize(): Promise<void> {
    // No-op: A-Coder CLI does not use Google ADC.
  }

  async headers(): Promise<HttpHeaders> {
    return {};
  }
}
