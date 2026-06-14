# A-Coder CLI extensions

A-Coder CLI extensions package prompts, MCP servers, custom commands, themes,
hooks, sub-agents, and agent skills into a familiar and user-friendly format.
With extensions, you can expand the capabilities of A-Coder CLI and share those
capabilities with others. They are designed to be easily installable and
shareable.

To see what's possible, browse the
[A-Coder CLI extension gallery](https://a-coder-cli.com/extensions/browse/).

## Choose your path

Choose the guide that best fits your needs.

### I want to use extensions

Learn how to discover, install, and manage extensions to enhance your A-Coder CLI
experience.

- **[Manage extensions](#manage-extensions):** List and verify your installed
  extensions.
- **[Install extensions](#installation):** Add new capabilities from GitHub or
  local paths.

### I want to build extensions

Learn how to create, test, and share your own extensions with the community.

- **[Build extensions](writing-extensions.md):** Create your first extension
  from a template.
- **[Best practices](best-practices.md):** Learn how to build secure and
  reliable extensions.
- **[Publish to the gallery](releasing.md):** Share your work with the world.

## Manage extensions

Use the interactive `/extensions` command to verify your installed extensions
and their status:

```bash
/extensions list
```

You can also manage extensions from your terminal using the `a-coder-cli extensions`
command group:

```bash
a-coder-cli extensions list
```

## Installation

Install an extension by providing its GitHub repository URL. For example:

```bash
a-coder-cli extensions install https://github.com/a-coder-cli-cli-extensions/workspace
```

For more advanced installation options, see the
[Extension reference](reference.md#install-an-extension).
