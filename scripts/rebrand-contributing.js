/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile } from 'node:fs/promises';

const FILE = process.cwd() + '/CONTRIBUTING.md';

const REPLACEMENTS = [
  ['cd gemini-cli', 'cd a-coder-cli'],
  [
    'To build both the `gemini` CLI utility and the sandbox container, run',
    'To build both the `a-coder-cli` CLI utility and the sandbox container, run',
  ],
  [
    'run the source build outside of the gemini-cli folder',
    'run the source build outside of the a-coder-cli folder',
  ],
  [
    '`npm link path/to/gemini-cli/packages/cli`',
    '`npm link path/to/a-coder-cli/packages/cli`',
  ],
  [
    '`alias gemini="node path/to/gemini-cli/packages/cli"` to run with `gemini`',
    '`alias a-coder-cli="node path/to/a-coder-cli/packages/cli"` to run with `a-coder-cli`',
  ],
  [
    '`node --inspect-brk dist/gemini.js`',
    '`node --inspect-brk dist/a-coder.js`',
  ],
  ['DEBUG=1 gemini', 'DEBUG=1 a-coder-cli'],
  [
    'gemini-cli due to automatic exclusion. Use `.a-coder/.env` files for gemini-cli',
    'a-coder-cli due to automatic exclusion. Use `.a-coder/.env` files for a-coder-cli',
  ],
  ['On macOS, `gemini` uses Seatbelt', 'On macOS, `a-coder-cli` uses Seatbelt'],
  [
    'running `gemini` with `BUILD_SANDBOX=1`',
    'running `a-coder-cli` with `BUILD_SANDBOX=1`',
  ],
  [
    '    (`gemini-3.1-pro-preview`). If you do not have enough Pro quota, you can run',
    '    (`a-coder-3.1-pro-preview`). If you do not have enough Pro quota, you can run',
  ],
  [
    '    `./scripts/review.sh <PR_NUMBER> gemini-3-flash-preview`.',
    '    `./scripts/review.sh <PR_NUMBER> a-coder-3-flash-preview`.',
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
    console.log('Updated CONTRIBUTING.md');
  } else {
    console.log('No CONTRIBUTING.md changes needed');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
