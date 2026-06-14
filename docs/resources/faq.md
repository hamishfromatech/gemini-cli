# Frequently asked questions (FAQ)

This page provides answers to common questions and solutions to frequent
problems encountered while using A-Coder CLI.

## General issues

This section addresses common questions about A-Coder CLI usage, security, and
troubleshooting general errors.

### Why can't I use third-party software like Claude Code, OpenClaw, or OpenCode with A-Coder CLI?

Using third-party software, tools, or services to harvest or piggyback on A-Coder
CLI's OAuth authentication to access our backend services is a direct violation
of our [applicable terms and policies](tos-privacy.md). Doing so bypasses our
intended authentication and security structures, and such actions may be grounds
for immediate suspension or termination of your account. If you would like to
use a third-party coding agent with A-Coder, the supported and secure method is
to use an OpenAI-compatible API key from your chosen provider.

### Why am I getting an `API error: 429 - Resource exhausted`?

This error indicates that you have exceeded your API request limit. The A-Coder
API has rate limits to prevent abuse and ensure fair usage.

To resolve this, you can:

- **Check your usage:** Review your API usage in your provider's dashboard
  (e.g., OpenAI, Azure, or your self-hosted endpoint).
- **Optimize your prompts:** If you are making many requests in a short period,
  try to batch your prompts or introduce delays between requests.
- **Request a quota increase:** If you consistently need a higher limit, you can
  request a quota increase from your API provider.

### Why am I getting an `ERR_REQUIRE_ESM` error when running `npm run start`?

This error typically occurs in Node.js projects when there is a mismatch between
CommonJS and ES Modules.

This is often due to a misconfiguration in your `package.json` or
`tsconfig.json`. Ensure that:

1.  Your `package.json` has `"type": "module"`.
2.  Your `tsconfig.json` has `"module": "NodeNext"` or a compatible setting in
    the `compilerOptions`.

If the problem persists, try deleting your `node_modules` directory and
`package-lock.json` file, and then run `npm install` again.

### Why don't I see cached token counts in my stats output?

Cached token information is only displayed when cached tokens are being used.
This feature is available for API key users (OpenAI-compatible API key) but not
for OAuth users. Support depends on your configured provider. You can still
view your total token usage using the `/stats` command in A-Coder CLI.

## Installation and updates

### How do I check which version of A-Coder CLI I'm currently running?

You can check your current A-Coder CLI version using one of these methods:

- Run `a-coder-cli --version` or `a-coder-cli -v` from your terminal
- Check the globally installed version using your package manager:
  - npm: `npm list -g @the-a-tech-corporation/a-coder-cli`
  - pnpm: `pnpm list -g @the-a-tech-corporation/a-coder-cli`
  - yarn: `yarn global list @the-a-tech-corporation/a-coder-cli`
  - bun: `bun pm ls -g @the-a-tech-corporation/a-coder-cli`
  - homebrew: `brew list --versions a-coder-cli-cli`
- Inside an active A-Coder CLI session, use the `/about` command

### How do I update A-Coder CLI to the latest version?

If you installed it globally via `npm`, update it using the command
`npm install -g @the-a-tech-corporation/a-coder-cli@latest`. If you compiled it from source, pull
the latest changes from the repository, and then rebuild using the command
`npm run build`.

## Platform-specific issues

### Why does the CLI crash on Windows when I run a command like `chmod +x`?

Commands like `chmod` are specific to Unix-like operating systems (Linux,
macOS). They are not available on Windows by default.

To resolve this, you can:

- **Use Windows-equivalent commands:** Instead of `chmod`, you can use `icacls`
  to modify file permissions on Windows.
- **Use a compatibility layer:** Tools like Git Bash or Windows Subsystem for
  Linux (WSL) provide a Unix-like environment on Windows where these commands
  will work.

## Configuration

### How do I configure my API provider?

Set the `A_CODER_API_KEY` environment variable to your OpenAI-compatible API key.
If you use a custom provider, also set `A_CODER_BASE_URL`.

**macOS/Linux**

```bash
export A_CODER_API_KEY="your-api-key"
export A_CODER_BASE_URL="https://api.openai.com/v1"
```

**Windows (PowerShell)**

```powershell
$env:A_CODER_API_KEY="your-api-key"
$env:A_CODER_BASE_URL="https://api.openai.com/v1"
```

To make this setting permanent, add this line to your shell's startup file (for
example, `~/.bashrc`, `~/.zshrc`).

### What is the best way to store my API keys securely?

Exposing API keys in scripts or checking them into source control is a security
risk.

To store your API keys securely, you can:

- **Use a `.env` file:** Create a `.env` file in your project's `.a-coder-cli`
  directory (`.a-coder-cli/.env`) and store your keys there. A-Coder CLI will
  automatically load these variables.
- **Use your system's keyring:** For the most secure storage, use your operating
  system's secret management tool (like macOS Keychain, Windows Credential
  Manager, or a secret manager on Linux). You can then have your scripts or
  environment load the key from the secure storage at runtime.

### Where are A-Coder CLI configuration and settings files stored?

A-Coder CLI configuration is stored in two `settings.json` files:

1.  In your home directory: `~/.a-coder-cli/settings.json`.
2.  In your project's root directory: `./.a-coder-cli/settings.json`.

Refer to [A-Coder CLI Configuration](../reference/configuration.md) for more
details.

## Google AI Pro/Ultra and subscription FAQs

### Where can I learn more about my Google AI Pro or Google AI Ultra subscription?

To learn more about your Google AI Pro or Google AI Ultra subscription, visit
**Manage subscription** in your [subscription settings](https://one.google.com).

### How do I know if I have higher limits for my API provider?

Quota limits are determined by your OpenAI-compatible API provider. Check your
provider's dashboard or subscription settings to see your current usage and
limits.

### What is the privacy policy for using A-Coder CLI?

A-Coder CLI does not collect or share your data. Your prompts and API traffic
are sent directly to the provider you configure. Review your provider's privacy
policy and terms of service for details.

### I've upgraded my API plan but still hit quota limits. Is this a bug?

No. A-Coder CLI passes requests to your configured provider, and rate limits are
enforced by that provider. Contact your provider or upgrade your plan if you
need higher limits.

### Will A-Coder CLI use my data to improve machine learning models?

A-Coder CLI does not use your data to improve any machine learning models. Your
data is sent only to the API provider you configure; refer to that provider's
privacy notice for their data-use policy.

## Not seeing your question?

Search the
[A-Coder CLI Q&A discussions on GitHub](https://github.com/google-a-coder-cli/a-coder-cli-cli/discussions/categories/q-a)
or
[start a new discussion on GitHub](https://github.com/google-a-coder-cli/a-coder-cli-cli/discussions/new?category=q-a)
