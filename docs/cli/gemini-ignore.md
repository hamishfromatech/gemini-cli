# Ignoring files

This document provides an overview of the A-Coder Ignore (`.a-coder-ignore`)
feature of A-Coder CLI.

A-Coder CLI includes the ability to automatically ignore files, similar to
`.gitignore` (used by Git) and `.aiexclude` (used by A-Coder Code Assist). Adding
paths to your `.a-coder-ignore` file will exclude them from tools that support
this feature, although they will still be visible to other services (such as
Git).

## How it works

When you add a path to your `.a-coder-ignore` file, tools that respect this file
will exclude matching files and directories from their operations. For example,
when you use the `@` command to share files, any paths in your `.a-coder-ignore`
file will be automatically excluded.

For the most part, `.a-coder-ignore` follows the conventions of `.gitignore`
files:

- Blank lines and lines starting with `#` are ignored.
- Standard glob patterns are supported (such as `*`, `?`, and `[]`).
- Putting a `/` at the end will only match directories.
- Putting a `/` at the beginning anchors the path relative to the
  `.a-coder-ignore` file.
- `!` negates a pattern.

You can update your `.a-coder-ignore` file at any time. To apply the changes, you
must restart your A-Coder CLI session.

## How to use `.a-coder-ignore`

To enable `.a-coder-ignore`:

1. Create a file named `.a-coder-ignore` in the root of your project directory.

To add a file or directory to `.a-coder-ignore`:

1. Open your `.a-coder-ignore` file.
2. Add the path or file you want to ignore, for example: `/archive/` or
   `apikeys.txt`.

### `.a-coder-ignore` examples

You can use `.a-coder-ignore` to ignore directories and files:

```
# Exclude your /packages/ directory and all subdirectories
/packages/

# Exclude your apikeys.txt file
apikeys.txt
```

You can use wildcards in your `.a-coder-ignore` file with `*`:

```
# Exclude all .md files
*.md
```

Finally, you can exclude files and directories from exclusion with `!`:

```
# Exclude all .md files except README.md
*.md
!README.md
```

To remove paths from your `.a-coder-ignore` file, delete the relevant lines.
