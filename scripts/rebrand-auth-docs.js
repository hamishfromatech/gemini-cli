/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile, writeFile } from 'node:fs/promises';

const FILE = process.cwd() + '/docs/get-started/authentication.mdx';

const REPLACEMENTS = [
  [
    "To use A-Coder CLI, you'll need to authenticate with Google. This guide helps you\nquickly find the best way to sign in based on your account type and how you're\nusing the CLI.",
    "To use A-Coder CLI, you'll need an OpenAI-compatible API key. This guide helps you\nquickly find the best way to authenticate based on your setup.",
  ],
  [
    '[Plans page](https://a-coder-cli.com/plans/).',
    '[Plans page](https://a-coder-cli.com/plans/).',
  ],
  [
    'For most users, we recommend starting A-Coder CLI and logging in with your\npersonal Google account.',
    'For most users, we recommend setting your API key as an environment variable and\nstarting A-Coder CLI.',
  ],
  [
    '## Choose your authentication method <a id="auth-methods"></a>',
    '## Choose your authentication method <a id="auth-methods"></a>',
  ],
  [
    '| Individual Google accounts                                             | [Sign in with Google](#login-google)                             | No, with exceptions                                         |\n| Organization users with a company, school, or Google Workspace account | [Sign in with Google](#login-google)                             | [Yes](#set-gcp)                                             |\n| AI Studio user with a Gemini API key                                   | [Use Gemini API Key](#gemini-api)                                | No                                                          |\n| Google Cloud Vertex AI user                                            | [Vertex AI](#vertex-ai)                                          | [Yes](#set-gcp)                                             |\n| [Headless mode](#headless)                                             | [Use Gemini API Key](#gemini-api) or<br /> [Vertex AI](#vertex-ai) | No (for Gemini API Key)<br /> [Yes](#set-gcp) (for Vertex AI) |',
    '| Individual users with an OpenAI API key                              | [Use OpenAI API Key](#api-key)                                   | No                                                          |\n| Organization users with a custom base URL                              | [Use a custom provider](#custom-provider)                        | No                                                          |\n| [Headless mode](#headless)                                             | [Use OpenAI API Key](#api-key)                                    | No                                                          |',
  ],
  [
    '### What is my Google account type?',
    '### What API providers are supported?',
  ],
  [
    '- **Individual Google accounts:** Includes all\n  [free tier accounts](../resources/quota-and-pricing.md#free-usage) such as\n  Gemini Code Assist for individuals, as well as paid subscriptions for\n  [Google AI Pro and Ultra](https://gemini.google/subscriptions/).',
    '- **OpenAI-compatible providers:** A-Coder CLI works with any provider that implements\n  the OpenAI Chat Completions API, including OpenAI, Azure OpenAI, and self-hosted endpoints.',
  ],
  [
    '- **Organization accounts:** Accounts using paid licenses through an\n  organization such as a company, school, or\n  [Google Workspace](https://workspace.google.com/). Includes\n  [Google AI Ultra for Business](https://support.google.com/a/answer/16345165)\n  subscriptions.',
    '- **Custom base URLs:** Use `A_CODER_BASE_URL` or `OPENAI_BASE_URL` to point A-Coder CLI\n  at a compatible proxy or on-premise deployment.',
  ],
  [
    '## (Recommended) Sign in with Google <a id="login-google"></a>',
    '## (Recommended) Use an OpenAI-compatible API key <a id="api-key"></a>',
  ],
  [
    'If you run A-Coder CLI on your local machine, the simplest authentication method\nis logging in with your Google account. This method requires a web browser on a\nmachine that can communicate with the terminal running A-Coder CLI (for example,\nyour local machine).',
    'If you run A-Coder CLI on your local machine, the simplest authentication method\nis setting your OpenAI-compatible API key as an environment variable.',
  ],
  [
    'If you are a **Google AI Pro** or **Google AI Ultra** subscriber, use the Google\naccount associated with your subscription.',
    'If you are using a provider other than OpenAI, you may also set `A_CODER_BASE_URL`.',
  ],
  [
    'To authenticate and use A-Coder CLI:\n\n1. Start the CLI:\n\n   ```bash\n   gemini\n   ```\n\n2. Select **Sign in with Google**. A-Coder CLI opens a sign in prompt using your\n   web browser. Follow the on-screen instructions. Your credentials will be\n   cached locally for future sessions.',
    'To authenticate and use A-Coder CLI:\n\n1. Set your API key:\n\n   ```bash\n   export A_CODER_API_KEY="YOUR_API_KEY"\n   # Optional: point to a custom OpenAI-compatible endpoint\n   export A_CODER_BASE_URL="https://api.openai.com/v1"\n   ```\n\n2. Start the CLI:\n\n   ```bash\n   a-coder-cli\n   ```\n\n   Your credentials will be read from the environment for each session.',
  ],
  [
    '### Do I need to set my Google Cloud project?',
    '### Do I need a Google Cloud project?',
  ],
  [
    "Most individual Google accounts (free and paid) don't require a Google Cloud\nproject for authentication. However, you'll need to set a Google Cloud project\nwhen you meet at least one of the following conditions:\n\n- You are using a company, school, or Google Workspace account.\n- You are using a Gemini Code Assist license from the Google Developer Program.\n- You are using a license from a Gemini Code Assist subscription.\n\nFor instructions, see [Set your Google Cloud Project](#set-gcp).",
    'No. A-Coder CLI does not use Google Cloud. Authentication is handled entirely\nthrough your OpenAI-compatible API key and optional base URL.',
  ],
  [
    '## Use Gemini API key <a id="gemini-api"></a>',
    '## Use a custom provider <a id="custom-provider"></a>',
  ],
  [
    "If you don't want to authenticate using your Google account, you can use an API\nkey from Google AI Studio.",
    'A-Coder CLI can be configured to use any OpenAI-compatible API endpoint.',
  ],
  [
    'To authenticate and use A-Coder CLI with a Gemini API key:\n\n1. Obtain your API key from\n   [Google AI Studio](https://aistudio.google.com/app/apikey).',
    'To authenticate with a custom provider:\n\n1. Obtain your API key and endpoint URL from your provider.',
  ],
  [
    '2. Set the `A_CODER_API_KEY` environment variable to your key. For example:',
    '2. Set the `A_CODER_API_KEY` environment variable and, if needed, `A_CODER_BASE_URL`.',
  ],
  [
    '# Replace YOUR_A_CODER_API_KEY with the key from AI Studio',
    '# Replace with your actual API key',
  ],
  [
    '```bash\n     # Replace YOUR_A_CODER_API_KEY with the key from AI Studio\n     export A_CODER_API_KEY="YOUR_A_CODER_API_KEY"\n    ```',
    '```bash\n     # Replace with your actual API key\n     export A_CODER_API_KEY="YOUR_API_KEY"\n     export A_CODER_BASE_URL="https://api.openai.com/v1"\n    ```',
  ],
  [
    '```powershell\n      # Replace YOUR_A_CODER_API_KEY with the key from AI Studio\n      $env:A_CODER_API_KEY="YOUR_A_CODER_API_KEY"\n     ```',
    '```powershell\n      # Replace with your actual API key\n      $env:A_CODER_API_KEY="YOUR_API_KEY"\n      $env:A_CODER_BASE_URL="https://api.openai.com/v1"\n     ```',
  ],
  [
    '3. Start the CLI:\n\n   ```bash\n   gemini\n   ```\n\n4. Select **Use Gemini API key**.',
    '3. Start the CLI:\n\n   ```bash\n   a-coder-cli\n   ```',
  ],
  [
    'Treat API keys, especially for services like Gemini, as sensitive',
    'Treat API keys, especially for services like OpenAI, as sensitive',
  ],
  ['## Use Vertex AI <a id="vertex-ai"></a>', ''],
  [
    "To use A-Coder CLI with Google Cloud's Vertex AI platform, choose from the\nfollowing authentication options:\n\n- A. Application Default Credentials (ADC) using `gcloud`.\n- B. Service account JSON key.\n- C. Google Cloud API key.",
    '',
  ],
];

async function main() {
  let content = await readFile(FILE, 'utf8');
  let changed = false;
  for (const [from, to] of REPLACEMENTS) {
    if (!to) continue;
    if (content.includes(from)) {
      content = content.replaceAll(from, to);
      changed = true;
    }
  }

  // Remove Vertex AI section if still present
  const vertexStart = content.indexOf(
    '## Use Vertex AI <a id="vertex-ai"></a>',
  );
  if (vertexStart !== -1) {
    const nextHeader = content.indexOf('## ', vertexStart + 1);
    const end = nextHeader === -1 ? content.length : nextHeader;
    content = content.slice(0, vertexStart) + content.slice(end);
    changed = true;
  }

  if (changed) {
    await writeFile(FILE, content, 'utf8');
    console.log('Updated docs/get-started/authentication.mdx');
  } else {
    console.log('No changes needed');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
