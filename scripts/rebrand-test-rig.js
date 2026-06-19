/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile } from 'node:fs/promises';

const FILE = process.cwd() + '/packages/test-utils/src/test-rig.ts';

const REPLACEMENTS = [
  ['bundle/gemini.js', 'bundle/a-coder.js'],
  [
    "join(os.tmpdir(), 'gemini-cli-tests')",
    "join(os.tmpdir(), 'a-coder-cli-tests')",
  ],
  ["selectedType: 'gemini-api-key'", "selectedType: 'openai-api-key'"],
  [
    "const geminiCommand = os.platform() === 'win32' ? 'gemini.cmd' : 'gemini';",
    "const aCoderCommand = os.platform() === 'win32' ? 'a-coder-cli.cmd' : 'a-coder-cli';",
  ],
  ['command = geminiCommand;', 'command = aCoderCommand;'],
  [
    "'gemini' (used to verify npm bundles).",
    "'a-coder-cli' (used to verify npm bundles).",
  ],
  ['`gemini_cli.${eventName}`', '`a_coder_cli.${eventName}`'],
  ["'gemini_cli.tool_call'", "'a_coder_cli.tool_call'"],
  ['`gemini_cli.api_request`', '`a_coder_cli.api_request`'],
  [
    "metricName.startsWith('gemini_cli.')",
    "metricName.startsWith('a_coder_cli.')",
  ],
  [
    "metricName.replace('gemini_cli.', '')",
    "metricName.replace('a_coder_cli.', '')",
  ],
  [': `gemini_cli.${metricName}`', ': `a_coder_cli.${metricName}`'],
  ['`gemini_cli.${metricName}`', '`a_coder_cli.${metricName}`'],
  ["'gemini_cli.memory.usage'", "'a_coder_cli.memory.usage'"],
  ["'gemini_cli.hook_call'", "'a_coder_cli.hook_call'"],
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
    console.log('Updated test-rig.ts');
  } else {
    console.log('No test-rig.ts changes needed');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
