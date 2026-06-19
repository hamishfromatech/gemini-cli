/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const REPLACEMENTS = [
  ["'gemini-cli[bot]'", "'a-coder-cli[bot]'"],
  ['@gemini-cli', '@a-coder-cli'],
  [
    'git config user.name "gemini-cli[bot]"',
    'git config user.name "a-coder-cli[bot]"',
  ],
  [
    'git config user.email "gemini-cli[bot]@users.noreply.github.com"',
    'git config user.email "a-coder-cli[bot]@users.noreply.github.com"',
  ],
  [
    '🤖 Gemini Bot Productivity Optimizations',
    '🤖 A-Coder CLI Bot Productivity Optimizations',
  ],
  [
    "A_CODER_MODEL: 'gemini-3-flash-preview'",
    "A_CODER_MODEL: 'a-coder-3-flash-preview'",
  ],
];

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'coverage',
  '.tmp',
  'bundle',
  'out',
  'build',
]);
const INCLUDED_EXTS = new Set([
  '.yml',
  '.yaml',
  '.ts',
  '.js',
  '.cjs',
  '.mjs',
  '.md',
  '.toml',
]);

async function walk(dir, results) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      await walk(fullPath, results);
    } else if (INCLUDED_EXTS.has(extname(fullPath))) {
      results.push(fullPath);
    }
  }
}

async function main() {
  const root = process.cwd() + '/.github/workflows';
  const files = [];
  await walk(root, files);

  for (const file of files) {
    let content;
    try {
      content = await readFile(file, 'utf8');
    } catch {
      continue;
    }
    let newContent = content;
    for (const [from, to] of REPLACEMENTS) {
      if (newContent.includes(from)) {
        newContent = newContent.replaceAll(from, to);
      }
    }
    if (newContent !== content) {
      await writeFile(file, newContent, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
