/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const REPLACEMENTS = [
  ['respectGeminiIgnore', 'respectACoderIgnore'],
  [
    'getFileFilteringRespectGeminiIgnore',
    'getFileFilteringRespectACoderIgnore',
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
const INCLUDED_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs']);

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
  const roots = [
    process.cwd() + '/packages/core/src',
    process.cwd() + '/packages/a2a-server/src',
  ];
  const files = [];
  for (const root of roots) {
    await walk(root, files);
  }

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
