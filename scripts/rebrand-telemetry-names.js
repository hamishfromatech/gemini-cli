/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile } from 'node:fs/promises';

const FILE = process.cwd() + '/docs/cli/telemetry.md';

async function main() {
  let content = await readFile(FILE, 'utf8');

  // Replace all gemini_cli. event/metric prefixes
  content = content.replaceAll('gemini_cli.', 'a_coder_cli.');

  // Fix generic Google Cloud console links
  content = content.replaceAll(
    '(https://console.cloud.google.com/logs/)',
    '(https://your-otlp-backend/logs/)',
  );
  content = content.replaceAll(
    '(https://console.cloud.google.com/monitoring/metrics-explorer)',
    '(https://your-otlp-backend/metrics-explorer)',
  );
  content = content.replaceAll(
    '(https://console.cloud.google.com/traces/list)',
    '(https://your-otlp-backend/traces/list)',
  );

  // Fix blog link
  content = content.replaceAll(
    '[Instant insights: A-Coder CLI’s pre-configured monitoring dashboards](https://cloud.google.com/blog/topics/developers-practitioners/instant-insights-a-coder-cli-clis-new-pre-configured-monitoring-dashboards/)',
    '[Instant insights: A-Coder CLI’s pre-configured monitoring dashboards](/docs/monitoring-dashboards)',
  );

  // Fix remaining Google-specific references
  content = content.replaceAll('GCP logs', 'provider logs');
  content = content.replaceAll(
    'Google Cloud documentation:',
    'OTLP backend documentation:',
  );
  content = content.replaceAll('Google Cloud Console', 'OTLP backend console');
  content = content.replaceAll(
    'and Cloud Logging.',
    'and your backend logging.',
  );
  content = content.replaceAll(
    'A-Coder Code Assist (Agent Mode)',
    'A-Coder CLI A2A Server',
  );
  content = content.replaceAll(
    '`A-CoderCLI-a2a-server`',
    '`A-CoderCLI-a2a-server`',
  );
  content = content.replaceAll('A-Coder API', 'the configured API');
  content = content.replaceAll('vertex_ai_enabled', 'custom_provider_enabled');

  // Remove gcloud-specific sections
  content = content.replaceAll(
    '**Method A: Application Default Credentials (ADC)**: Use this method for\n      service accounts or standard `gcloud` authentication.\n      - For user accounts:\n        ```bash\n        gcloud auth application-default login\n        ```\n      - For service accounts:\n\n        **macOS/Linux**\n\n        ```bash\n        # export OTLP_AUTH_HEADER="Bearer your-token"\n        ```\n\n        **Windows (PowerShell)**\n\n        ```powershell\n        # $env:OTLP_AUTH_HEADER="Bearer your-token"\n        ```\n    ',
    '**Method A: Bearer token**: Set `OTLP_AUTH_HEADER` with a token accepted by your backend.\n',
  );

  content = content.replaceAll(
    '    - Cloud Trace Agent\n    - Monitoring Metric Writer\n    - Logs Writer\n',
    '    - Trace write access\n    - Metrics write access\n    - Logs write access\n',
  );

  content = content.replaceAll(
    '    ```bash\n    gcloud services enable \\\n      cloudtrace.googleapis.com \\\n      monitoring.googleapis.com \\\n      logging.googleapis.com,\n\n    ```\n',
    '',
  );

  content = content.replaceAll('`"gcp"`/`"local"`', '`"otlp"`/`"local"`');

  await writeFile(FILE, content, 'utf8');
  console.log('Updated telemetry.md event names');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
