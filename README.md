# A-Coder CLI

```
 ▝▜▄
```

[![License](https://img.shields.io/github/license/hamishfromatech/a-coder-cli)](https://github.com/hamishfromatech/a-coder-cli/blob/main/LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A520-339933)](https://nodejs.org)

A-Coder CLI is an open-source AI agent that brings OpenAI-compatible language
models — including local servers like Ollama and LM Studio — directly into your
terminal. Part of the A-Coder product series by **The A-Tech Corporation**.

- **OpenAI-compatible out of the box** — point it at OpenAI, Ollama, LM Studio,
  vLLM, or any other OpenAI-shaped endpoint.
- **No vendor lock-in** — no proprietary auth, no Google SDKs, no telemetry you
  can't turn off. Apache 2.0.
- **Built-in tools** — file operations, shell, web fetch, search, MCP servers.
- **Auto mode** — a model-based permission classifier that handles ~93% of
  approvals without prompting while blocking the dangerous ones.
- **Terminal-first** — designed for developers who live in the command line.

Learn more in the [documentation](docs/).

## 🚀 Installation

The recommended install is a one-liner that builds from source and installs a
wrapper to `~/.local/bin/a-coder-cli` (or `/usr/local/bin` with `--system`). No
npm, no npx, no separate dependency tree to manage.

```bash
curl -fsSL https://raw.githubusercontent.com/hamishfromatech/a-coder-cli/rebrand/a-coder-cli/scripts/install.sh | bash
```

This clones the repo, builds the bundle, copies it to
`~/.local/share/a-coder-cli/`, and writes `a-coder-cli` to your `~/.local/bin/`.
If `~/.local/bin` isn't already on your `PATH`, the installer prints the exact
line to add to your shell profile.

### Other install paths

| Method                                               | When to use                                                                             |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `curl ... \| bash` (default)                         | Most users. Builds from source, no Node tooling required.                               |
| `./scripts/install.sh --system`                      | Want the wrapper in `/usr/local/bin` for all users.                                     |
| `./scripts/install.sh --prefix ~/.local`             | Equivalent to the one-liner. Use this when you already have the repo cloned.            |
| `git clone ... && cd ... && ./scripts/install.sh`    | You're hacking on A-Coder and want to install your local build.                         |
| `npm install -g @the-a-tech-corporation/a-coder-cli` | You need a published version. (Tag not currently published; prefer the install script.) |

### Requirements

- **Node.js 20+** — the install script will refuse anything older.
- **macOS 15+, Ubuntu 20.04+, or Windows 11 24H2+** — same baseline as the
  published npm package.
- 4 GB RAM for casual use, 16 GB for long sessions on large codebases.

## 🏃 Quick start

Point the wrapper at any OpenAI-compatible endpoint and start chatting:

```bash
export OPENAI_API_KEY=sk-...
a-coder-cli
```

Equivalent A-Coder-specific env vars are also accepted — `A_CODER_API_KEY`,
`A_CODER_BASE_URL`, `A_CODER_MODEL`. The `OPENAI_*` names are preferred for
portability with other OpenAI-shaped tooling.

### Run against a local model

```bash
# Ollama
export A_CODER_BASE_URL=http://localhost:11434/v1
export A_CODER_MODEL=qwen3:14b
a-coder-cli
```

The same shape works for LM Studio, vLLM, llama.cpp's server, TGI, and any other
server that speaks the OpenAI chat-completions API.

### Configure interactively

The first time you run `a-coder-cli` on a fresh machine it drops you into the
**provider picker** — pick "OpenAI" or "OpenAI-compatible", paste your key, and
you're set. You can re-run the picker any time with `/provider`.

```
> /provider
> /models        # browse and switch the active model
> /auth          # (deprecated) re-enter credentials
```

## 🛡️ Approval modes

A-Coder asks before running anything that touches your filesystem, network, or
shell. There are five modes, ordered by how much they trust the agent:

| Mode        | Behavior                                                         |
| ----------- | ---------------------------------------------------------------- |
| `plan`      | Read-only. The agent proposes a plan; nothing executes.          |
| `default`   | Prompt for every destructive action.                             |
| `auto_edit` | Auto-approve file edits; prompt for everything else.             |
| `auto`      | Delegate approvals to a model-based classifier (see below).      |
| `yolo`      | Auto-approve everything. **Skip this on shared infrastructure.** |

### The new `auto` mode

`auto` is the safer middle ground between `default` and `yolo`. Instead of
prompting you for every action, the CLI runs a two-stage reasoning-blind
classifier on the active model:

1. **Tier 1** — built-in safe tools (read-only) and in-project file writes
   bypass the classifier entirely. No latency.
2. **Tier 2** — a fast yes/no filter catches the obvious cases; flagged actions
   escalate to chain-of-thought reasoning.
3. **Tier 3** — after 3 consecutive or 20 total denials, escalate back to the
   user so a stuck agent can't loop.

The classifier is **reasoning-blind** — it never reads assistant text or tool
outputs, so prompt-injection content in fetched URLs or files can't talk its way
past the gate. Default block rules cover scope escalation, credential
exploration, exfiltration, and shared-infrastructure bypass.

Activation:

```bash
# At startup
a-coder-cli --approval-mode=auto

# Or persistently in settings.json
{ "general": { "defaultApprovalMode": "auto" } }

# Or interactively — Shift+Tab cycles:
#   default → auto_edit → auto → [plan →] default
```

You can extend the trusted-domain boundary (cloud buckets, internal services) so
they don't get flagged as exfiltration targets. See
`Config.autoModeTrustedDomains` in the source.

> Auto mode is not a substitute for careful review on high-stakes
> infrastructure. It catches overeager behavior and honest mistakes, but it can
> still let through things the user technically authorized.

## ⌨️ Keybindings

| Binding     | Action                                                            |
| ----------- | ----------------------------------------------------------------- |
| `Shift+Tab` | Cycle approval mode (default → auto_edit → auto → plan → default) |
| `Ctrl+Y`    | Toggle YOLO on/off                                                |
| `Enter`     | Submit prompt                                                     |
| `Esc`       | Cancel current operation                                          |
| `↑` / `↓`   | Scroll through history                                            |

See `/help` in the running CLI for the full list, or
[docs/cli/cli-reference.md](docs/cli/cli-reference.md).

## 🧩 Slash commands

A-Coder ships with built-in slash commands for common operations:

| Command     | What it does                                                                  |
| ----------- | ----------------------------------------------------------------------------- |
| `/provider` | Pick an OpenAI-compatible provider and configure the base URL + key.          |
| `/models`   | Browse and switch the active model for the current session.                   |
| `/plan`     | Enter plan mode — the agent reads and proposes, then waits for your approval. |
| `/clear`    | Reset the conversation history.                                               |
| `/compress` | Compress long context to stay under the model's window.                       |
| `/rewind`   | Revert to a previous checkpoint.                                              |
| `/auth`     | **Deprecated** — re-enter credentials. Prefer `/provider`.                    |
| `/help`     | Show all slash commands.                                                      |

Custom commands can be added per-project via `.a-coder/commands/*.toml`. See
[docs/cli/custom-commands.md](docs/cli/custom-commands.md).

## 🔌 Extensibility

- **MCP (Model Context Protocol)** — connect to any MCP server for custom tool
  integrations. See [docs/extensions/](docs/extensions/).
- **Skills** — bundle repeatable workflows into loadable skills. A-Coder
  discovers them from `.a-coder/skills/`, `.claude/skills/`, and
  `.opencode/skills/`. See [docs/cli/skills.md](docs/cli/skills.md).
- **Themes** — customize the terminal UI. See
  [docs/cli/themes.md](docs/cli/themes.md).
- **Sandbox** — run shell commands inside a sandboxed environment. See
  [docs/cli/sandbox.md](docs/cli/sandbox.md).

## 🔐 Privacy & telemetry

A-Coder is fully open source and ships with no required telemetry. You can opt
in to optional usage analytics via the `--telemetry` flag or `telemetry.enabled`
in settings. Even when enabled, no conversation content or tool outputs are sent
off-device — only aggregate event counts.

No Google SDKs, no Google auth flows, no Google telemetry. The OpenAI transport
goes directly from your machine to the endpoint you configured.

## 🏗️ Development

For local development setup, building, and testing, see
[docs/local-development.md](docs/local-development.md). The short version:

```bash
git clone https://github.com/hamishfromatech/a-coder-cli
cd a-coder-cli
npm install
npm run build
./scripts/install.sh --prefix ~/.local --skip-build
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution guide, and
[docs/issue-and-pr-automation.md](docs/issue-and-pr-automation.md) for how the
bot triages issues and PRs.

## 📄 License

Apache 2.0 — see [LICENSE](LICENSE).

---

A-Coder CLI is part of the A-Coder product series by
[The A-Tech Corporation](https://github.com/hamishfromatech).
