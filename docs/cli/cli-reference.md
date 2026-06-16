# A-Coder CLI cheatsheet

This page provides a reference for commonly used A-Coder CLI commands, options,
and parameters.

## CLI commands

| Command                                 | Description                        | Example                                                                |
| --------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| `a-coder-cli`                           | Start interactive REPL             | `a-coder-cli`                                                          |
| `a-coder-cli -p "query"`                | Query non-interactively            | `a-coder-cli -p "summarize README.md"`                                 |
| a-coder-cli "query"                     | Query and continue interactively   | a-coder-cli "explain this project"                                     |
| `cat file \| a-coder-cli`               | Process piped content              | `cat logs.txt \| a-coder-cli`<br>`Get-Content logs.txt \| a-coder-cli` |
| `a-coder-cli -i "query"`                | Execute and continue interactively | `a-coder-cli -i "What is the purpose of this project?"`                |
| `a-coder-cli -r "latest"`               | Continue most recent session       | `a-coder-cli -r "latest"`                                              |
| `a-coder-cli -r "latest" "query"`       | Continue session with a new prompt | `a-coder-cli -r "latest" "Check for type errors"`                      |
| `a-coder-cli -r "<session-id>" "query"` | Resume session by ID               | `a-coder-cli -r "abc123" "Finish this PR"`                             |
| `a-coder-cli update`                    | Update to latest version           | `a-coder-cli update`                                                   |
| `a-coder-cli extensions`                | Manage extensions                  | See [Extensions Management](#extensions-management)                    |
| `a-coder-cli mcp`                       | Configure MCP servers              | See [MCP Server Management](#mcp-server-management)                    |

### Positional arguments

| Argument | Type              | Description                                                                                                |
| -------- | ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `query`  | string (variadic) | Positional prompt. Defaults to interactive mode in a TTY. Use `-p/--prompt` for non-interactive execution. |

## Interactive commands

These commands are available within the interactive REPL.

| Command              | Description                                      |
| -------------------- | ------------------------------------------------ |
| `/skills reload`     | Reload discovered skills from disk               |
| `/agents reload`     | Reload the agent registry                        |
| `/commands list`     | List available custom slash commands             |
| `/commands reload`   | Reload custom slash commands                     |
| `/memory reload`     | Reload context files (for example, `A-Coder.md`) |
| `/mcp reload`        | Restart and reload MCP servers                   |
| `/extensions reload` | Reload all active extensions                     |
| `/help`              | Show help for all commands                       |
| `/quit`              | Exit the interactive session                     |

## CLI Options

| Option                           | Alias | Type    | Default   | Description                                                                                                                                                            |
| -------------------------------- | ----- | ------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--debug`                        | `-d`  | boolean | `false`   | Run in debug mode with verbose logging                                                                                                                                 |
| `--version`                      | `-v`  | -       | -         | Show CLI version number and exit                                                                                                                                       |
| `--help`                         | `-h`  | -       | -         | Show help information                                                                                                                                                  |
| `--model`                        | `-m`  | string  | `auto`    | Model to use. See [Model Selection](#model-selection) for available values.                                                                                            |
| `--prompt`                       | `-p`  | string  | -         | Prompt text. Appended to stdin input if provided. Forces non-interactive mode.                                                                                         |
| `--prompt-interactive`           | `-i`  | string  | -         | Execute prompt and continue in interactive mode                                                                                                                        |
| `--worktree`                     | `-w`  | string  | -         | Start A-Coder in a new git worktree. If no name is provided, one is generated automatically. Requires `experimental.worktrees: true` in settings.                      |
| `--sandbox`                      | `-s`  | boolean | `false`   | Run in a sandboxed environment for safer execution                                                                                                                     |
| `--skip-trust`                   | -     | boolean | `false`   | Trust the current workspace for this session, skipping the folder trust check.                                                                                         |
| `--approval-mode`                | -     | string  | `default` | Approval mode for tool execution. Choices: `default`, `auto_edit`, `yolo`, `plan`                                                                                      |
| `--yolo`                         | `-y`  | boolean | `false`   | **Deprecated.** Auto-approve all actions. Use `--approval-mode=yolo` instead.                                                                                          |
| `--experimental-acp`             | -     | boolean | -         | Start in ACP (Agent Code Pilot) mode. **Experimental feature.**                                                                                                        |
| `--experimental-zed-integration` | -     | boolean | -         | Run in Zed editor integration mode. **Experimental feature.**                                                                                                          |
| `--allowed-mcp-server-names`     | -     | array   | -         | Allowed MCP server names (comma-separated or multiple flags)                                                                                                           |
| `--allowed-tools`                | -     | array   | -         | **Deprecated.** Use the [Policy Engine](../reference/policy-engine.md) instead. Tools that are allowed to run without confirmation (comma-separated or multiple flags) |
| `--extensions`                   | `-e`  | array   | -         | List of extensions to use. If not provided, all extensions are enabled (comma-separated or multiple flags)                                                             |
| `--list-extensions`              | `-l`  | boolean | -         | List all available extensions and exit                                                                                                                                 |
| `--resume`                       | `-r`  | string  | -         | Resume a previous session. Use `"latest"` for most recent or index number (for example `--resume 5`)                                                                   |
| `--list-sessions`                | -     | boolean | -         | List available sessions for the current project and exit                                                                                                               |
| `--delete-session`               | -     | string  | -         | Delete a session by index number (use `--list-sessions` to see available sessions)                                                                                     |
| `--include-directories`          | -     | array   | -         | Additional directories to include in the workspace (comma-separated or multiple flags)                                                                                 |
| `--screen-reader`                | -     | boolean | -         | Enable screen reader mode for accessibility                                                                                                                            |
| `--output-format`                | `-o`  | string  | `text`    | The format of the CLI output. Choices: `text`, `json`, `stream-json`                                                                                                   |

## Model selection

The `--model` (or `-m`) flag lets you specify which A-Coder model to use. You
can use either model aliases (user-friendly names) or concrete model names.

### Model aliases

These are convenient shortcuts that map to specific models:

| Alias        | Resolves To                                          | Description                                                                                                               |
| ------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `auto`       | `a-coder-cli-2.5-pro` or `a-coder-cli-3-pro-preview` | **Default.** Resolves to the preview model if preview features are enabled, otherwise resolves to the standard pro model. |
| `pro`        | `a-coder-cli-2.5-pro` or `a-coder-cli-3-pro-preview` | For complex reasoning tasks. Uses preview model if enabled.                                                               |
| `flash`      | `a-coder-cli-2.5-flash`                              | Fast, balanced model for most tasks.                                                                                      |
| `flash-lite` | `a-coder-cli-2.5-flash-lite`                         | Fastest model for simple tasks.                                                                                           |

## Extensions management

| Command                                                 | Description                                  | Example                                                                             |
| ------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------- |
| `a-coder-cli extensions install <source>`               | Install extension from Git URL or local path | `a-coder-cli extensions install https://github.com/user/my-extension`               |
| `a-coder-cli extensions install <source> --ref <ref>`   | Install from specific branch/tag/commit      | `a-coder-cli extensions install https://github.com/user/my-extension --ref develop` |
| `a-coder-cli extensions install <source> --auto-update` | Install with auto-update enabled             | `a-coder-cli extensions install https://github.com/user/my-extension --auto-update` |
| `a-coder-cli extensions uninstall <name>`               | Uninstall one or more extensions             | `a-coder-cli extensions uninstall my-extension`                                     |
| `a-coder-cli extensions list`                           | List all installed extensions                | `a-coder-cli extensions list`                                                       |
| `a-coder-cli extensions update <name>`                  | Update a specific extension                  | `a-coder-cli extensions update my-extension`                                        |
| `a-coder-cli extensions update --all`                   | Update all extensions                        | `a-coder-cli extensions update --all`                                               |
| `a-coder-cli extensions enable <name>`                  | Enable an extension                          | `a-coder-cli extensions enable my-extension`                                        |
| `a-coder-cli extensions disable <name>`                 | Disable an extension                         | `a-coder-cli extensions disable my-extension`                                       |
| `a-coder-cli extensions link <path>`                    | Link local extension for development         | `a-coder-cli extensions link /path/to/extension`                                    |
| `a-coder-cli extensions new <path>`                     | Create new extension from template           | `a-coder-cli extensions new ./my-extension`                                         |
| `a-coder-cli extensions validate <path>`                | Validate extension structure                 | `a-coder-cli extensions validate ./my-extension`                                    |

See [Extensions Documentation](../extensions/index.md) for more details.

## MCP server management

| Command                                                            | Description                     | Example                                                                                                   |
| ------------------------------------------------------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `a-coder-cli mcp add <name> <command>`                             | Add stdio-based MCP server      | `a-coder-cli mcp add github npx -y @modelcontextprotocol/server-github`                                   |
| `a-coder-cli mcp add <name> <url> --transport http`                | Add HTTP-based MCP server       | `a-coder-cli mcp add api-server http://localhost:3000 --transport http`                                   |
| `a-coder-cli mcp add <name> <command> --env KEY=value`             | Add with environment variables  | `a-coder-cli mcp add slack node server.js --env SLACK_TOKEN=xoxb-xxx`                                     |
| `a-coder-cli mcp add <name> <command> --scope user`                | Add with user scope             | `a-coder-cli mcp add db node db-server.js --scope user`                                                   |
| `a-coder-cli mcp add <name> <command> --include-tools tool1,tool2` | Add with specific tools         | `a-coder-cli mcp add github npx -y @modelcontextprotocol/server-github --include-tools list_repos,get_pr` |
| `a-coder-cli mcp remove <name>`                                    | Remove an MCP server            | `a-coder-cli mcp remove github`                                                                           |
| `a-coder-cli mcp list`                                             | List all configured MCP servers | `a-coder-cli mcp list`                                                                                    |

See [MCP Server Integration](../tools/mcp-server.md) for more details.

## Skills management

| Command                               | Description                           | Example                                                |
| ------------------------------------- | ------------------------------------- | ------------------------------------------------------ |
| `a-coder-cli skills list`             | List all discovered agent skills      | `a-coder-cli skills list`                              |
| `a-coder-cli skills install <source>` | Install skill from Git, path, or file | `a-coder-cli skills install https://github.com/u/repo` |
| `a-coder-cli skills link <path>`      | Link local agent skills via symlink   | `a-coder-cli skills link /path/to/my-skills`           |
| `a-coder-cli skills uninstall <name>` | Uninstall an agent skill              | `a-coder-cli skills uninstall my-skill`                |
| `a-coder-cli skills enable <name>`    | Enable an agent skill                 | `a-coder-cli skills enable my-skill`                   |
| `a-coder-cli skills disable <name>`   | Disable an agent skill                | `a-coder-cli skills disable my-skill`                  |
| `a-coder-cli skills enable --all`     | Enable all skills                     | `a-coder-cli skills enable --all`                      |
| `a-coder-cli skills disable --all`    | Disable all skills                    | `a-coder-cli skills disable --all`                     |

See [Agent Skills Documentation](./skills.md) for more details.
