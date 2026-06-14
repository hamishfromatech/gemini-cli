/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DEFAULT_A_CODER_FLASH_LITE_MODEL,
  DEFAULT_A_CODER_FLASH_MODEL,
  DEFAULT_A_CODER_MODEL,
  PREVIEW_A_CODER_FLASH_MODEL,
  PREVIEW_A_CODER_MODEL,
  GEMMA_4_31B_IT_MODEL,
  GEMMA_4_26B_A4B_IT_MODEL,
} from '../config/models.js';

type Model = string;
type TokenCount = number;

export const DEFAULT_TOKEN_LIMIT = 1_048_576;
export const GEMMA_4_TOKEN_LIMIT = 256_000;

export function tokenLimit(model: Model): TokenCount {
  // Add other models as they become relevant or if specified by config
  // Pulled from https://ai.google.dev/gemini-api/docs/models
  switch (model) {
    case GEMMA_4_31B_IT_MODEL:
    case GEMMA_4_26B_A4B_IT_MODEL:
      return GEMMA_4_TOKEN_LIMIT;
    case PREVIEW_A_CODER_MODEL:
    case PREVIEW_A_CODER_FLASH_MODEL:
    case DEFAULT_A_CODER_MODEL:
    case DEFAULT_A_CODER_FLASH_MODEL:
    case DEFAULT_A_CODER_FLASH_LITE_MODEL:
      return 1_048_576;
    default:
      return DEFAULT_TOKEN_LIMIT;
  }
}
