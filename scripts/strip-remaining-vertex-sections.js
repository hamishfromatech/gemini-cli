/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile } from 'node:fs/promises';

const FILE = process.cwd() + '/docs/get-started/authentication.mdx';

async function main() {
  let content = await readFile(FILE, 'utf8');

  const start = content.indexOf('## B. Vertex AI - service account JSON key');
  if (start === -1) {
    console.log('No remaining Vertex AI section found');
    return;
  }

  // Find the headless section which follows the Set GCP section
  const headlessStart = content.indexOf(
    '## Running in headless mode <a id="headless"',
  );
  const end = headlessStart === -1 ? content.length : headlessStart;

  let newContent = content.slice(0, start) + content.slice(end);

  // Fix any leftover gemini command references in headless section
  newContent = newContent.replaceAll(
    '```bash\ngemini\n```',
    '```bash\na-coder-cli\n```',
  );

  await writeFile(FILE, newContent, 'utf8');
  console.log('Removed remaining Vertex AI / GCP sections');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
