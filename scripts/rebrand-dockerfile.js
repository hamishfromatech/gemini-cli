/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile } from 'node:fs/promises';

const FILE = process.cwd() + '/Dockerfile';

const REPLACEMENTS = [
  [
    'ARG SANDBOX_NAME="gemini-cli-sandbox"',
    'ARG SANDBOX_NAME="a-coder-cli-sandbox"',
  ],
  ['# install gemini-cli and clean up', '# install a-coder-cli and clean up'],
  [
    'packages/cli/dist/google-gemini-cli-*.tgz /tmp/gemini-cli.tgz',
    'packages/cli/dist/the-a-tech-corporation-a-coder-cli-*.tgz /tmp/a-coder-cli.tgz',
  ],
  [
    'packages/core/dist/google-gemini-cli-core-*.tgz /tmp/gemini-core.tgz',
    'packages/core/dist/the-a-tech-corporation-core-*.tgz /tmp/a-coder-core.tgz',
  ],
  [
    'RUN npm install -g /tmp/gemini-core.tgz',
    'RUN npm install -g /tmp/a-coder-core.tgz',
  ],
  [
    '  && npm install -g /tmp/gemini-cli.tgz',
    '  && npm install -g /tmp/a-coder-cli.tgz',
  ],
  [
    '  && gemini --version > /dev/null',
    '  && a-coder-cli --version > /dev/null',
  ],
  [
    '  && rm -f /tmp/gemini-{cli,core}.tgz',
    '  && rm -f /tmp/a-coder-{cli,core}.tgz',
  ],
  [
    'ENTRYPOINT ["/usr/local/share/npm-global/bin/gemini"]',
    'ENTRYPOINT ["/usr/local/share/npm-global/bin/a-coder-cli"]',
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
    console.log('Updated Dockerfile');
  } else {
    console.log('No Dockerfile changes needed');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
