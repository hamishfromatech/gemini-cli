/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const REPLACEMENTS = [
  [
    "name: '🏷️ Gemini Automated Issue Deduplication'",
    "name: '🏷️ A-Coder Automated Issue Deduplication'",
  ],
  [
    "name: '🏷️ Gemini Automated Issue Triage'",
    "name: '🏷️ A-Coder Automated Issue Triage'",
  ],
  [
    "name: '🔄 Gemini Scheduled Lifecycle Manager'",
    "name: '🔄 A-Coder Scheduled Lifecycle Manager'",
  ],
  [
    "name: '📋 Gemini Scheduled Issue Deduplication'",
    "name: '📋 A-Coder Scheduled Issue Deduplication'",
  ],
  [
    "name: '📋 Gemini Scheduled Issue Triage'",
    "name: '📋 A-Coder Scheduled Issue Triage'",
  ],
  [
    "name: 'Gemini Scheduled PR Triage 🚀'",
    "name: 'A-Coder Scheduled PR Triage 🚀'",
  ],
  [
    "- name: 'Run Gemini Issue Deduplication Refresh'",
    "- name: 'Run A-Coder Issue Deduplication Refresh'",
  ],
  [
    "- name: 'Run Gemini Issue Analysis'",
    "- name: 'Run A-Coder Issue Analysis'",
  ],
  [
    "- name: 'Run Docs Audit with Gemini'",
    "- name: 'Run Docs Audit with A-Coder'",
  ],
  [
    '# It uses Gemini to generate release notes and creates a PR with the changes.',
    '# It uses A-Coder CLI to generate release notes and creates a PR with the changes.',
  ],
  [
    "- name: 'Generate Changelog with Gemini'",
    "- name: 'Generate Changelog with A-Coder'",
  ],
  [
    "description: 'The expected Gemini binary version that should be released (e.g., 0.5.0-preview-2).'",
    "description: 'The expected A-Coder CLI binary version that should be released (e.g., 0.5.0-preview-2).'",
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

async function walk(dir, results) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      await walk(fullPath, results);
    } else if (extname(fullPath) === '.yml' || extname(fullPath) === '.yaml') {
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
