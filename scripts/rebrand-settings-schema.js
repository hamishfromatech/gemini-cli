/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile } from 'node:fs/promises';

const FILE = process.cwd() + '/packages/cli/src/config/settingsSchema.ts';

const REPLACEMENTS = [
  [
    "description: 'The Gemini model to use for conversations.'",
    "description: 'The model to use for conversations.'",
  ],
  ['respectGeminiIgnore: {', 'respectACoderIgnore: {'],
  [
    "description: 'Enable access to Gemma 4 models via Gemini API.'",
    "description: 'Enable access to Gemma 4 models via the configured API.'",
  ],
  ["default: 'gemini-live',", "default: 'whisper',"],
  [
    'The backend to use for voice transcription. Note: When using the\n              Gemini Live backend, voice recordings are sent to Google Cloud for\n              transcription.',
    'The backend to use for voice transcription.',
  ],
  [
    "{ value: 'gemini-live', label: 'Gemini Live API (Cloud)' }",
    "{ value: 'openai-whisper', label: 'OpenAI Whisper API' }",
  ],
  [
    "'Enable the Gemma Model Router (experimental). Requires a local endpoint serving Gemma via the Gemini API using LiteRT-LM shim.'",
    "'Enable the Gemma Model Router (experimental). Requires a local endpoint serving Gemma via a compatible API.'",
  ],
  ["useGemini3_1: { type: 'boolean' }", "useACoder3_1: { type: 'boolean' }"],
  [
    "useGemini3_1FlashLite: { type: 'boolean' }",
    "useACoder3_1FlashLite: { type: 'boolean' }",
  ],
  ["label: 'Vertex AI'", "label: 'Custom Provider (Legacy Vertex)'"],
  [
    "description: 'Vertex AI request routing settings.'",
    "description: 'Custom provider request routing settings (legacy Vertex AI shape).'",
  ],
  [
    "'Sets the X-Vertex-AI-LLM-Request-Type header for Vertex AI requests.'",
    "'Sets the X-Provider-Request-Type header for custom provider requests.'",
  ],
  [
    "'Sets the X-Vertex-AI-LLM-Shared-Request-Type header for Vertex AI requests.'",
    "'Sets the X-Provider-Shared-Request-Type header for custom provider requests.'",
  ],
];

async function main() {
  let content = await readFile(FILE, 'utf8');
  let changed = false;
  for (const [from, to] of REPLACEMENTS) {
    if (content.includes(from)) {
      content = content.replaceAll(from, to);
      changed = true;
    }
  }

  if (changed) {
    await writeFile(FILE, content, 'utf8');
    console.log('Updated settingsSchema.ts');
  } else {
    console.log('No settingsSchema.ts changes needed');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
