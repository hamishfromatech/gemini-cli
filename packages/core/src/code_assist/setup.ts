/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import {
  UserTierId,
  type IneligibleTier,
} from './types.js';
import type { HttpOptions } from './server.js';
type AuthClient = unknown;
import type { Config } from '../config/config.js';

export class ProjectIdRequiredError extends Error {
  constructor() {
    super(
      'This account requires setting the GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_PROJECT_ID env var.',
    );
    this.name = 'ProjectIdRequiredError';
  }
}

export class InvalidNumericProjectIdError extends Error {
  constructor(projectId: string) {
    super(
      `Invalid Google Cloud Project ID: "${projectId}". The GOOGLE_CLOUD_PROJECT (or GOOGLE_CLOUD_PROJECT_ID) environment variable must be set to your string-based Project ID (e.g., "my-project-123"), not your numeric Project Number. Please update your environment variables.`,
    );
    this.name = 'InvalidNumericProjectIdError';
  }
}

/**
 * Error thrown when user cancels the validation process.
 * This is a non-recoverable error that should result in auth failure.
 */
export class ValidationCancelledError extends Error {
  constructor() {
    super('User cancelled account validation');
    this.name = 'ValidationCancelledError';
  }
}

export class IneligibleTierError extends Error {
  readonly ineligibleTiers: IneligibleTier[];

  constructor(ineligibleTiers: IneligibleTier[]) {
    const reasons = ineligibleTiers.map((t) => t.reasonMessage).join(', ');
    super(reasons);
    this.name = 'IneligibleTierError';
    this.ineligibleTiers = ineligibleTiers;
  }
}

export interface UserData {
  projectId: string;
  userTier: UserTierId;
  userTierName?: string;
  paidTier?: import('./types.js').GeminiUserTier;
  hasOnboardedPreviously?: boolean;
}

/**
 * Resets the user data cache. Used exclusively for test isolation.
 * @internal
 */
export function resetUserDataCacheForTesting() {
  // No-op: caching is disabled in the stub.
}

/**
 * Sets up the user by loading their Code Assist configuration and onboarding if needed.
 *
 * This stub implementation returns a default user without calling any Google
 * endpoints. It preserves the original function signature for compile-time
 * compatibility.
 *
 * @param _client - The authenticated client to use for API calls
 * @param _config - The CLI configuration
 * @param _httpOptions - Optional HTTP options
 * @returns The user's project ID, tier ID, and tier name
 */
export async function setupUser(
   
  _client: AuthClient,
   
  _config: Config,
   
  _httpOptions: HttpOptions = {},
): Promise<UserData> {
  return {
    projectId: '',
    userTier: UserTierId.STANDARD,
  };
}
