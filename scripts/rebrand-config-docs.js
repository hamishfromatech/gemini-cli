/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile } from 'node:fs/promises';

const FILE = process.cwd() + '/docs/reference/configuration.md';

async function main() {
  let content = await readFile(FILE, 'utf8');

  const start = content.indexOf('- **`GOOGLE_API_KEY`**:');
  const next = content.indexOf('- **`A_CODER_BASE_URL`**:', start);
  if (start !== -1 && next !== -1) {
    content = content.slice(0, start) + content.slice(next);
  }

  const start2 = content.indexOf('- **`GOOGLE_CLOUD_PROJECT`**:');
  const next2 = content.indexOf(
    '- **`GOOGLE_APPLICATION_CREDENTIALS`**',
    start2,
  );
  if (start2 !== -1 && next2 !== -1) {
    content = content.slice(0, start2) + content.slice(next2);
  }

  const start3 = content.indexOf('- **`GOOGLE_APPLICATION_CREDENTIALS`**');
  const next3 = content.indexOf('- **`GOOGLE_GENAI_API_VERSION`**:', start3);
  if (start3 !== -1 && next3 !== -1) {
    content = content.slice(0, start3) + content.slice(next3);
  }

  const start4 = content.indexOf('- **`GOOGLE_GENAI_API_VERSION`**:');
  const next4 = content.indexOf('- **`A_CODER_BASE_URL`**:', start4);
  if (start4 !== -1 && next4 !== -1) {
    content = content.slice(0, start4) + content.slice(next4);
  }

  const start5 = content.indexOf('- **`GOOGLE_VERTEX_BASE_URL`**:');
  const next5 = content.indexOf('- **`OTLP_GOOGLE_CLOUD_PROJECT`**:', start5);
  if (start5 !== -1 && next5 !== -1) {
    content = content.slice(0, start5) + content.slice(next5);
  }

  const start6 = content.indexOf('- **`OTLP_GOOGLE_CLOUD_PROJECT`**:');
  const next6 = content.indexOf('- **`A_CODER_TELEMETRY_ENABLED`**:', start6);
  if (start6 !== -1 && next6 !== -1) {
    content = content.slice(0, start6) + content.slice(next6);
  }

  const start7 = content.indexOf('- **`GOOGLE_CLOUD_LOCATION`**:');
  const next7 = content.indexOf('- **`A_CODER_SANDBOX`**:', start7);
  if (start7 !== -1 && next7 !== -1) {
    content = content.slice(0, start7) + content.slice(next7);
  }

  // Fix leftover A_Coder API key auth wording
  content = content.replaceAll(
    '`a-coder-cli-api-key` authentication',
    '`openai-api-key` authentication',
  );
  content = content.replaceAll(
    'A-Coder API requests',
    'OpenAI-compatible API requests',
  );

  await writeFile(FILE, content, 'utf8');
  console.log('Updated configuration.md');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
