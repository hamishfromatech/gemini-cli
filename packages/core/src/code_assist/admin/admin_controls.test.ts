/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import { describe, it } from 'vitest';
import {
  fetchAdminControls,
  fetchAdminControlsOnce,
  sanitizeAdminSettings,
  stopAdminControlsPolling,
  getAdminErrorMessage,
  getAdminBlockedMcpServersMessage,
} from './admin_controls.js';

describe('Admin Controls', () => {
  it('is stubbed for A-Coder CLI', () => {
    void fetchAdminControls;
    void fetchAdminControlsOnce;
    void sanitizeAdminSettings;
    void stopAdminControlsPolling;
    void getAdminErrorMessage;
    void getAdminBlockedMcpServersMessage;
  });
});
