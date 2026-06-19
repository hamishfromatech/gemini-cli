/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const REPLACEMENTS = [
  ['PARAM_RESPECT_A_CODER_IGNORE', 'PARAM_RESPECT_A_CODER_IGNORE'],
  ['respect_a_coder_ignore', 'respect_a_coder_ignore'],
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
  '.jsx',
  '.cjs',
  '.mjs',
  '.md',
  '.mdx',
  '.json',
  '.snap',
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
  const root = process.cwd();
  const files = [];
  await walk(root, files);

  let changedFiles = 0;
  let totalReplacements = 0;

  for (const file of files) {
    let content;
    try {
      content = await readFile(file, 'utf8');
    } catch {
      continue;
    }

    let newContent = content;
    let fileChanged = false;
    for (const [from, to] of REPLACEMENTS) {
      if (newContent.includes(from)) {
        const count = (
          newContent.match(new RegExp(from.replace(/\$/g, '\\$'), 'g')) || []
        ).length;
        newContent = newContent.replaceAll(from, to);
        fileChanged = true;
        totalReplacements += count;
      }
    }

    if (fileChanged) {
      await writeFile(file, newContent, 'utf8');
      changedFiles++;
      console.log(`Updated ${file}`);
    }
  }

  console.log(
    `\nChanged ${changedFiles} files, ${totalReplacements} replacements`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
