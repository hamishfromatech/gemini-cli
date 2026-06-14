/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import { describe, it } from 'vitest';
import {
  getOauthClient,
  resetOauthClientForTesting,
  clearCachedCredentialFile,
  clearOauthClientCache,
  authEvents,
} from './oauth2.js';

describe('oauth2', () => {
  it('is stubbed for A-Coder CLI', () => {
    void getOauthClient;
    void resetOauthClientForTesting;
    void clearCachedCredentialFile;
    void clearOauthClientCache;
    void authEvents;
  });
});
