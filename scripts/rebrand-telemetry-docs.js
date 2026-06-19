/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile } from 'node:fs/promises';

const FILE = process.cwd() + '/docs/cli/telemetry.md';

const REPLACEMENTS = [
  [
    '- Universal compatibility: Export to any OpenTelemetry backend (Google Cloud,',
    '- Universal compatibility: Export to any OpenTelemetry backend (local collector,',
  ],
  ['## Google Cloud telemetry', '## OTLP telemetry backend'],
  [
    'You can export telemetry data directly to Google Cloud Trace, Cloud Monitoring,',
    'You can export telemetry data directly to any OTLP-compatible backend,',
  ],
  [
    'You must complete several setup steps before enabling Google Cloud telemetry.',
    'You must complete several setup steps before enabling OTLP telemetry.',
  ],
  [
    '1.  Set your Google Cloud project ID:',
    '1.  Set your OTLP project or endpoint identifier:',
  ],
  [
    '      export OTLP_GOOGLE_CLOUD_PROJECT="your-telemetry-project-id"',
    '      export OTLP_PROJECT="your-telemetry-project-id"',
  ],
  [
    '      $env:OTLP_GOOGLE_CLOUD_PROJECT="your-telemetry-project-id"',
    '      $env:OTLP_PROJECT="your-telemetry-project-id"',
  ],
  [
    '      export GOOGLE_CLOUD_PROJECT="your-project-id"',
    '      # Optional: export PROJECT_ID="your-project-id"',
  ],
  [
    '      $env:GOOGLE_CLOUD_PROJECT="your-project-id"',
    '      # Optional: $env:PROJECT_ID="your-project-id"',
  ],
  [
    '2.  Authenticate with Google Cloud using one of these methods:',
    '2.  Configure authentication for your OTLP backend as required.',
  ],
  [
    '      export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account.json"',
    '      # export OTLP_AUTH_HEADER="Bearer your-token"',
  ],
  [
    '      $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\your\\service-account.json"',
    '      # $env:OTLP_AUTH_HEADER="Bearer your-token"',
  ],
  [
    '4.  Enable the required Google Cloud APIs:',
    '4.  Ensure your OTLP backend is reachable and accepts the configured protocol.',
  ],
  ['      --project="$OTLP_GOOGLE_CLOUD_PROJECT"', ''],
  [
    'We recommend using direct export to send telemetry directly to Google Cloud',
    'We recommend using direct export to send telemetry directly to your OTLP backend',
  ],
  [
    'View logs, metrics, and traces in the Google Cloud Console. See',
    'View logs, metrics, and traces in your OTLP backend console. See',
  ],
  ['### View Google Cloud telemetry', '### View OTLP telemetry'],
  ['Google Cloud Console.', 'your OTLP backend console.'],
  [
    '[Google Cloud Monitoring](https://cloud.google.com/monitoring) dashboard to',
    '[your monitoring dashboard] to',
  ],
  [
    'Find this dashboard under **Google Cloud Monitoring Dashboard Templates** as',
    "Find this dashboard under your backend's dashboard templates as",
  ],
];

async function main() {
  let content = await readFile(FILE, 'utf8');
  let changed = false;
  for (const [from, to] of REPLACEMENTS) {
    if (!to && to !== '') continue;
    if (content.includes(from)) {
      content = content.replaceAll(from, to);
      changed = true;
    }
  }

  // Remove gcloud auth bullet if present
  content = content.replace(
    /- \*\*gcloud auth application-default login\*\*:.*?(\n\n|$)/s,
    '',
  );

  if (changed) {
    await writeFile(FILE, content, 'utf8');
    console.log('Updated telemetry.md');
  } else {
    console.log('No telemetry.md changes needed');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
