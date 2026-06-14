/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import { describe, it } from 'vitest';
import {
  createConversationOffered,
  formatProtoJsonDuration,
  recordConversationOffered,
  recordToolCallInteractions,
} from './telemetry.js';

describe('telemetry', () => {
  it('is stubbed for A-Coder CLI', () => {
    void createConversationOffered;
    void formatProtoJsonDuration;
    void recordConversationOffered;
    void recordToolCallInteractions;
  });
});
