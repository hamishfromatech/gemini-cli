# A-Coder CLI

[![License](https://img.shields.io/github/license/hamishfromatech/a-coder-cli)](https://github.com/hamishfromatech/a-coder-cli/blob/main/LICENSE)

A-Coder CLI is an open-source AI agent that brings local and OpenAI-compatible
language models directly into your terminal. It is part of the A-Coder product
series by **The A-Tech Corporation**.

Learn more in the [documentation](docs/).

## 🚀 Why A-Coder CLI?

- **🔌 OpenAI-compatible**: Works with OpenAI, local servers (Ollama, LM Studio),
  and any OpenAI-compatible API.
- **🔧 Built-in tools**: file operations, shell commands, web fetching, and more.
- **🧩 Extensible**: MCP (Model Context Protocol) support for custom
  integrations.
- **💻 Terminal-first**: Designed for developers who live in the command line.
- **🛡️ Open source**: Apache 2.0 licensed.

## 📦 Installation

```bash
# Using npx (no installation required)
npx @the-a-tech-corporation/a-coder-cli

# Install globally with npm
npm install -g @the-a-tech-corporation/a-coder-cli
```

## 🏃 Quick start

```bash
# Set your OpenAI-compatible API key
export OPENAI_API_KEY=your-api-key

# Start chatting with your terminal
a-coder-cli
```

A-Coder CLI reads the standard environment variables:

- `OPENAI_API_KEY` / `A_CODER_API_KEY` – API key
- `OPENAI_BASE_URL` / `A_CODER_BASE_URL` – custom base URL
- `OPENAI_MODEL` / `A_CODER_MODEL` – default model

## 🧑‍💻 Local model example

```bash
# Run against an Ollama server
export A_CODER_BASE_URL=http://localhost:11434/v1
export A_CODER_MODEL=qwen3:14b
a-coder-cli
```

## 🏗️ Development

See [docs/local-development.md](docs/local-development.md) for setup instructions.

## 📄 License

Apache 2.0 – see [LICENSE](LICENSE).
