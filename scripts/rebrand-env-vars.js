/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

const REPLACEMENTS = [
  // Core env vars read from process.env
  ['A_CODER_CONFIG_DIR', 'A_CODER_CONFIG_DIR'],
  ['A_CODER_FORCE_FILE_STORAGE', 'A_CODER_FORCE_FILE_STORAGE'],
  ['A_CODER_FOLDER_TRUST', 'A_CODER_FOLDER_TRUST'],
  ['A_CODER_YOLO_MODE', 'A_CODER_YOLO_MODE'],
  ['A_CODER_DEFAULT_AUTH_TYPE', 'A_CODER_DEFAULT_AUTH_TYPE'],
  ['A_CODER_PTY_INFO', 'A_CODER_PTY_INFO'],
  ['A_CODER_DEBUG_LOG_FILE', 'A_CODER_DEBUG_LOG_FILE'],
  ['A_CODER_PROMPT_', 'A_CODER_PROMPT_'],
  ['A_CODER_SYSTEM_MD', 'A_CODER_SYSTEM_MD'],
  ['A_CODER_WRITE_SYSTEM_MD', 'A_CODER_WRITE_SYSTEM_MD'],
  ['A_CODER_CONTEXT_TRACE_DIR', 'A_CODER_CONTEXT_TRACE_DIR'],
  [
    'A_CODER_CONTEXT_CALIBRATE_TOKEN_CALCULATIONS',
    'A_CODER_CONTEXT_CALIBRATE_TOKEN_CALCULATIONS',
  ],
  // Telemetry
  ['A_CODER_TELEMETRY_ENABLED', 'A_CODER_TELEMETRY_ENABLED'],
  ['A_CODER_TELEMETRY_TRACES_ENABLED', 'A_CODER_TELEMETRY_TRACES_ENABLED'],
  ['A_CODER_TELEMETRY_TARGET', 'A_CODER_TELEMETRY_TARGET'],
  ['A_CODER_TELEMETRY_OTLP_ENDPOINT', 'A_CODER_TELEMETRY_OTLP_ENDPOINT'],
  ['A_CODER_TELEMETRY_OTLP_PROTOCOL', 'A_CODER_TELEMETRY_OTLP_PROTOCOL'],
  ['A_CODER_TELEMETRY_LOG_PROMPTS', 'A_CODER_TELEMETRY_LOG_PROMPTS'],
  ['A_CODER_TELEMETRY_OUTFILE', 'A_CODER_TELEMETRY_OUTFILE'],
  ['A_CODER_TELEMETRY_USE_COLLECTOR', 'A_CODER_TELEMETRY_USE_COLLECTOR'],
  ['A_CODER_TELEMETRY_USE_CLI_AUTH', 'A_CODER_TELEMETRY_USE_CLI_AUTH'],
  ['A_CODER_TELEMETRY_DISABLED', 'A_CODER_TELEMETRY_DISABLED'],
  // Sandbox
  ['A_CODER_SANDBOX_PROXY_COMMAND', 'A_CODER_SANDBOX_PROXY_COMMAND'],
  ['A_CODER_SANDBOX_IMAGE_TAG', 'A_CODER_SANDBOX_IMAGE_TAG'],
  ['A_CODER_SANDBOX_IMAGE', 'A_CODER_SANDBOX_IMAGE'],
  ['A_CODER_SANDBOX', 'A_CODER_SANDBOX'],
  // API / model config
  ['A_CODER_API_KEY', 'A_CODER_API_KEY'],
  ['A_CODER_MODEL', 'A_CODER_MODEL'],
  ['A_CODER_BASE_URL', 'A_CODER_BASE_URL'],
  // Performance / test env vars
  ['A_CODER_MEMORY_MONITOR_INTERVAL', 'A_CODER_MEMORY_MONITOR_INTERVAL'],
  ['A_CODER_EVENT_LOOP_MONITOR_ENABLED', 'A_CODER_EVENT_LOOP_MONITOR_ENABLED'],
  // Hook env vars
  ['A_CODER_PROJECT_DIR', 'A_CODER_PROJECT_DIR'],
  ['A_CODER_PLANS_DIR', 'A_CODER_PLANS_DIR'],
  ['A_CODER_SESSION_ID', 'A_CODER_SESSION_ID'],
  ['A_CODER_CWD', 'A_CODER_CWD'],
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
  '.toml',
  '.sh',
  '.sb',
  '.snap',
  '.env',
  '.test',
]);

const INCLUDED_NAMES = new Set([
  'Dockerfile',
  'Makefile',
  '.lycheeignore',
  '.gitignore',
  'action.yml',
]);

async function shouldProcess(filePath, dirent) {
  if (dirent.isDirectory()) return false;
  const name = filePath.split(/[\\/]/).pop();
  if (EXCLUDED_DIRS.has(name)) return false;
  if (INCLUDED_NAMES.has(name)) return true;
  const ext = extname(filePath);
  if (INCLUDED_EXTS.has(ext)) return true;
  return false;
}

async function walk(dir, results) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      await walk(fullPath, results);
    } else if (await shouldProcess(fullPath, entry)) {
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
      let idx = newContent.indexOf(from);
      while (idx !== -1) {
        newContent = newContent.replaceAll(from, to);
        fileChanged = true;
        totalReplacements++;
        idx = newContent.indexOf(from);
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
