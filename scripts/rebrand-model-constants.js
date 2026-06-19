/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const REPLACEMENTS = [
  ['PREVIEW_A_CODER_3_1_MODEL', 'PREVIEW_A_CODER_3_1_MODEL'],
  [
    'PREVIEW_A_CODER_3_1_CUSTOM_TOOLS_MODEL',
    'PREVIEW_A_CODER_3_1_CUSTOM_TOOLS_MODEL',
  ],
  ['PREVIEW_A_CODER_FLASH_MODEL', 'PREVIEW_A_CODER_FLASH_MODEL'],
  ['PREVIEW_A_CODER_FLASH_LITE_MODEL', 'PREVIEW_A_CODER_FLASH_LITE_MODEL'],
  ['DEFAULT_A_CODER_FLASH_MODEL', 'DEFAULT_A_CODER_FLASH_MODEL'],
  ['DEFAULT_A_CODER_3_5_FLASH_MODEL', 'DEFAULT_A_CODER_3_5_FLASH_MODEL'],
  ['SECONDARY_A_CODER_3_5_FLASH_MODEL', 'SECONDARY_A_CODER_3_5_FLASH_MODEL'],
  ['DEFAULT_A_CODER_FLASH_LITE_MODEL', 'DEFAULT_A_CODER_FLASH_LITE_MODEL'],
  ['DEFAULT_A_CODER_EMBEDDING_MODEL', 'DEFAULT_A_CODER_EMBEDDING_MODEL'],
  ['PREVIEW_A_CODER_MODEL_AUTO', 'PREVIEW_A_CODER_MODEL_AUTO'],
  ['DEFAULT_A_CODER_MODEL_AUTO', 'DEFAULT_A_CODER_MODEL_AUTO'],
  // Function/identifier renames
  ['setACoderFlashModels', 'setACoderFlashModels'],
  ['VALID_A_CODER_MODELS', 'VALID_A_CODER_MODELS'],
  // Experiment flag names
  ['A_CODER_3_1_PRO_LAUNCHED', 'A_CODER_3_1_PRO_LAUNCHED'],
  ['A_CODER_3_5_FLASH_GA_LAUNCHED', 'A_CODER_3_5_FLASH_GA_LAUNCHED'],
  // Capability identifiers
  ['isACoder3Model', 'isACoder3Model'],
  ['isACoder2Model', 'isACoder2Model'],
  ['isACoderModel', 'isACoderModel'],
  ['isACoder35FlashModel', 'isACoder35FlashModel'],
  ['getACoder31LaunchedSync', 'getACoder31LaunchedSync'],
  ['hasACoder35FlashGAAccess', 'hasACoder35FlashGAAccess'],
  ['useACoder31', 'useACoder31'],
  ['useACoder3_5Flash', 'useACoder3_5Flash'],
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
  '.yml',
  '.yaml',
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
      if (from === to) continue;
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
