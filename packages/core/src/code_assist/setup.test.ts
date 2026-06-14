/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import { describe, it } from 'vitest';
import {
  ProjectIdRequiredError,
  setupUser,
  ValidationCancelledError,
  InvalidNumericProjectIdError,
  resetUserDataCacheForTesting,
} from './setup.js';

describe('setupUser', () => {
  it('is stubbed for A-Coder CLI', () => {
    void ProjectIdRequiredError;
    void setupUser;
    void ValidationCancelledError;
    void InvalidNumericProjectIdError;
    void resetUserDataCacheForTesting;
  });
});
