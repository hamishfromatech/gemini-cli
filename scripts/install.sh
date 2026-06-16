#!/usr/bin/env bash
#
# Install A-Coder CLI from source without publishing to npm.
#
# Usage:
#   ./scripts/install.sh
#   ./scripts/install.sh --prefix ~/.local
#   ./scripts/install.sh --prefix /usr/local --system
#
# One-liner install:
#   curl -fsSL https://raw.githubusercontent.com/hamishfromatech/gemini-cli/rebrand/a-coder-cli/scripts/install.sh | bash
#
# This script builds the bundled CLI binary, copies it to
# $PREFIX/share/a-coder-cli/, and adds a wrapper to $PREFIX/bin
# so `a-coder-cli` is available on PATH.

set -euo pipefail

REPO_URL="https://github.com/hamishfromatech/gemini-cli.git"
REPO_BRANCH="rebrand/a-coder-cli"

PREFIX="${A_CODER_INSTALL_PREFIX:-$HOME/.local}"
SYSTEM=false
SKIP_BUILD=false
CLEANUP=false

usage() {
  cat <<EOF
Install A-Coder CLI from source.

Options:
  --prefix PATH   Install wrappers to PATH/bin (default: $HOME/.local)
  --system        Short for --prefix /usr/local
  --skip-build    Skip npm run bundle (use if already built)
  -h, --help      Show this help message
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prefix)
      PREFIX="$2"
      shift 2
      ;;
    --system)
      PREFIX="/usr/local"
      SYSTEM=true
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

BIN_DIR="$PREFIX/bin"
SHARE_DIR="$PREFIX/share/a-coder-cli"
BUNDLE_DIR="$SHARE_DIR/bundle"
BUNDLE_JS="$BUNDLE_DIR/a-coder.js"

# --- Detect whether we're running from a cloned repo or via curl | bash ---
SCRIPT_PATH="${BASH_SOURCE[0]:-$0}"
if [[ -f "$SCRIPT_PATH" ]] && [[ -d "$(dirname "$SCRIPT_PATH")/../.git" ]]; then
  REPO_ROOT="$(cd "$(dirname "$SCRIPT_PATH")/.." && pwd)"
else
  # Running via curl | bash — clone the repo to a temp directory.
  CLEANUP=true
  REPO_ROOT="$(mktemp -d -t a-coder-cli-build-XXXXXX)"
  echo "Cloning A-Coder CLI repository..."
  git clone --depth 1 --branch "$REPO_BRANCH" "$REPO_URL" "$REPO_ROOT"
fi

BUNDLE_SRC="$REPO_ROOT/bundle"

# --- Cleanup helper ---
cleanup() {
  if [[ "$CLEANUP" == true ]] && [[ -d "$REPO_ROOT" ]]; then
    rm -rf "$REPO_ROOT"
  fi
}
trap cleanup EXIT

# --- Check Node.js version ---
if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required but not installed." >&2
  echo "Install Node.js >= 20 from https://nodejs.org/" >&2
  exit 1
fi

NODE_VERSION="$(node -v | sed 's/^v//')"
NODE_MAJOR="${NODE_VERSION%%.*}"
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  echo "Error: Node.js >= 20 is required (found $NODE_VERSION)." >&2
  exit 1
fi

# --- Install dependencies if needed ---
if [[ ! -d "$REPO_ROOT/node_modules" ]]; then
  echo "Installing dependencies..."
  if [[ -f "$REPO_ROOT/package-lock.json" ]]; then
    (cd "$REPO_ROOT" && npm ci)
  else
    (cd "$REPO_ROOT" && npm install)
  fi
fi

# --- Build bundle ---
if [[ "$SKIP_BUILD" != true ]]; then
  echo "Building A-Coder CLI bundle..."
  (cd "$REPO_ROOT" && npm run bundle)
fi

if [[ ! -f "$BUNDLE_SRC/a-coder.js" ]]; then
  echo "Error: bundle not found at $BUNDLE_SRC/a-coder.js" >&2
  exit 1
fi

# --- Copy bundle into the install location ---
echo "Installing A-Coder CLI bundle to $SHARE_DIR..."
rm -rf "$BUNDLE_DIR"
mkdir -p "$BUNDLE_DIR"
cp -R "$BUNDLE_SRC/"* "$BUNDLE_DIR/"

# --- Create wrapper scripts ---
echo "Installing A-Coder CLI wrapper to $BIN_DIR..."
mkdir -p "$BIN_DIR"

# Normalize slashes for Windows batch file.
BUNDLE_JS_WIN="${BUNDLE_JS//\//\\}"

# Unix / Git Bash wrapper
cat > "$BIN_DIR/a-coder-cli" <<EOF
#!/bin/sh
exec node "$BUNDLE_JS" "\$@"
EOF
chmod +x "$BIN_DIR/a-coder-cli"

# Windows cmd wrapper (used by regular Command Prompt / PowerShell when .cmd is on PATH)
cat > "$BIN_DIR/a-coder-cli.cmd" <<EOF
@echo off
node "$BUNDLE_JS_WIN" %*
EOF

# PowerShell wrapper
cat > "$BIN_DIR/a-coder-cli.ps1" <<EOF
#!/usr/bin/env pwsh
\$ErrorActionPreference = 'Stop'
& node "$BUNDLE_JS" @args
EOF

# --- Report ---
echo ""
echo "A-Coder CLI installed successfully."
echo "  Wrapper: $BIN_DIR/a-coder-cli"
echo "  Bundle:  $BUNDLE_DIR"
echo ""

if [[ "$SYSTEM" == true ]]; then
  echo "Make sure $BIN_DIR is on your PATH."
else
  case ":${PATH}:" in
    *":$BIN_DIR:"*)
      echo "Run it now: a-coder-cli"
      ;;
    *)
      echo "Add the following to your shell profile to put it on PATH:"
      echo "  export PATH=\"$BIN_DIR:\$PATH\""
      echo "Then run: a-coder-cli"
      ;;
  esac
fi
