/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

export * from './src/index.js';
export { Storage } from './src/config/storage.js';
export {
  DEFAULT_A_CODER_MODEL,
  DEFAULT_A_CODER_MODEL_AUTO,
  DEFAULT_A_CODER_FLASH_MODEL,
  DEFAULT_A_CODER_FLASH_LITE_MODEL,
  DEFAULT_A_CODER_EMBEDDING_MODEL,
} from './src/config/models.js';
export {
  serializeTerminalToObject,
  type AnsiOutput,
  type AnsiLine,
  type AnsiToken,
} from './src/utils/terminalSerializer.js';
export { DEFAULT_TRUNCATE_TOOL_OUTPUT_THRESHOLD } from './src/config/config.js';
export { detectIdeFromEnv } from './src/ide/detect-ide.js';
export { makeFakeConfig } from './src/test-utils/config.js';
export * from './src/utils/pathReader.js';
export { getErrorStatus, ModelNotFoundError } from './src/utils/httpErrors.js';
