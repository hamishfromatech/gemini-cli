/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const REPLACEMENTS = [
  ['`gemini-cli-bot`', '`a-coder-cli-bot`'],
  ['gemini-cli-bot/', 'a-coder-cli-bot/'],
  ['gemini-cli-bot-pulse.yml', 'a-coder-cli-bot-pulse.yml'],
  ['gemini-cli-bot-brain.yml', 'a-coder-cli-bot-brain.yml'],
  ["GITHUB_OWNER = 'google-gemini'", "GITHUB_OWNER = 'the-a-tech-corporation'"],
  ["GITHUB_REPO = 'gemini-cli'", "GITHUB_REPO = 'a-coder-cli'"],
  ["'gemini-cli-bot'", "'a-coder-cli-bot'"],
  [
    "join(process.cwd(), 'tools', 'gemini-cli-bot', 'history')",
    "join(process.cwd(), 'tools', 'a-coder-cli-bot', 'history')",
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
  '.ts',
  '.tsx',
  '.js',
  '.cjs',
  '.mjs',
  '.md',
  '.toml',
  '.yml',
  '.yaml',
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
  const root = process.cwd() + '/tools/a-coder-cli-bot';
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
