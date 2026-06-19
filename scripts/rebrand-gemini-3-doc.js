/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile } from 'node:fs/promises';

const FILE = process.cwd() + '/docs/get-started/gemini-3.md';

async function main() {
  let content = await readFile(FILE, 'utf8');

  const start = content.indexOf(
    '## How to enable A-Coder 3 with A-Coder CLI on A-Coder Code Assist',
  );
  if (start !== -1) {
    content = content.slice(0, start).trimEnd() + '\n';
  }

  content = content.replaceAll('A-Coder Code Assist', 'A-Coder CLI');
  await writeFile(FILE, content, 'utf8');
  console.log('Updated gemini-3.md');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
