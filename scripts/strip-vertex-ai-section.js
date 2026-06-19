/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile } from 'node:fs/promises';

const FILE = process.cwd() + '/docs/get-started/authentication.mdx';

async function main() {
  let content = await readFile(FILE, 'utf8');

  const start = content.indexOf(
    '## A. Vertex AI - application default credentials (ADC) using `gcloud`',
  );
  if (start === -1) {
    console.log('Vertex AI section not found');
    return;
  }

  const next = content.indexOf('## ', start + 1);
  const end = next === -1 ? content.length : next;

  // Remove from start of Vertex AI section to next ## header
  let newContent = content.slice(0, start) + content.slice(end);

  // Remove Google Cloud environments section if present
  const cloudStart = newContent.indexOf(
    '## Running in Google Cloud environments <a id="cloud-env"></a>',
  );
  if (cloudStart !== -1) {
    const cloudNext = newContent.indexOf('## ', cloudStart + 1);
    const cloudEnd = cloudNext === -1 ? newContent.length : cloudNext;
    newContent = newContent.slice(0, cloudStart) + newContent.slice(cloudEnd);
  }

  // Fix headless bullet references
  newContent = newContent.replace(
    '- [Use Gemini API Key](#gemini-api)\n- [Vertex AI](#vertex-ai)',
    '- [Use OpenAI-compatible API Key](#api-key)\n- [Use a custom provider](#custom-provider)',
  );

  await writeFile(FILE, newContent, 'utf8');
  console.log('Removed Vertex AI and Google Cloud sections');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
