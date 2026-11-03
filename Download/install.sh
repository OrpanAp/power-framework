#!/usr/bin/env bash
set -Eeuo pipefail

# Create a new P.O.W.E.R. 2.0 project from GitHub.
PROJECT_NAME="${1:-}"

usage() {
  printf 'Usage: power-new ProjectName\n'
  printf 'Example: power-new my-app\n'
}

if [[ -z "$PROJECT_NAME" ]]; then
  usage >&2
  exit 1
fi

if [[ ! "$PROJECT_NAME" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]]; then
  echo "Error: use a name starting with a letter or number, followed by letters, numbers, dots, underscores, or hyphens." >&2
  exit 1
fi

if [[ -e "$PROJECT_NAME" ]]; then
  echo "Error: '$PROJECT_NAME' already exists. Choose another name or move the existing folder first." >&2
  exit 1
fi

for tool in curl unzip find cp mv mkdir mktemp; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Error: required command '$tool' was not found. Install it and retry." >&2
    exit 1
  fi
done

# Keep temporary files under the current directory instead of /tmp.
# This avoids Git Bash/Windows temporary-path mismatches and keeps the
# final rename on the same filesystem.
TMP=""
cleanup() {
  if [[ -n "$TMP" && -d "$TMP" ]]; then
    rm -rf -- "$TMP"
  fi
}
trap cleanup EXIT
trap 'status=$?; echo "Error: installer failed (exit code $status)." >&2; exit "$status"' ERR

TMP="$(mktemp -d "./.power-install.XXXXXX")" || {
  echo "Error: could not create a temporary folder in '$PWD'. Check folder permissions." >&2
  exit 1
}

ARCHIVE_URL="https://codeload.github.com/OrpanAp/power-2.0/zip/refs/heads/main"
ARCHIVE="$TMP/power.zip"
EXTRACT_DIR="$TMP/source"
STAGING_DIR="$TMP/project"

echo "Downloading P.O.W.E.R. 2.0..."
if ! curl --fail --location --show-error --retry 3 --retry-all-errors --connect-timeout 20 --output "$ARCHIVE" "$ARCHIVE_URL"; then
  echo "Error: download failed. Check your internet connection and try again." >&2
  exit 1
fi

if [[ ! -s "$ARCHIVE" ]]; then
  echo "Error: GitHub returned an empty archive. No project was created." >&2
  exit 1
fi

mkdir -p "$EXTRACT_DIR"
if ! unzip -tq "$ARCHIVE" >/dev/null; then
  echo "Error: downloaded file is not a valid ZIP archive. No project was created." >&2
  exit 1
fi

if ! unzip -q "$ARCHIVE" -d "$EXTRACT_DIR"; then
  echo "Error: could not extract the P.O.W.E.R. 2.0 archive." >&2
  exit 1
fi

SOURCE_DIR="$(find "$EXTRACT_DIR" -mindepth 1 -maxdepth 1 -type d -print -quit)"
if [[ -z "$SOURCE_DIR" || ! -f "$SOURCE_DIR/package.json" ]]; then
  echo "Error: the downloaded archive did not contain the expected project files." >&2
  exit 1
fi

mkdir -p "$STAGING_DIR"
cp -R "$SOURCE_DIR"/. "$STAGING_DIR"/

if [[ ! -f "$STAGING_DIR/bin/power-cli.js" ]]; then
  echo "Error: the downloaded project is missing bin/power-cli.js. No project was created." >&2
  exit 1
fi

# Recheck immediately before creating the destination.
if [[ -e "$PROJECT_NAME" ]]; then
  echo "Error: '$PROJECT_NAME' appeared during installation; refusing to overwrite it." >&2
  exit 1
fi

mv "$STAGING_DIR" "$PROJECT_NAME"

echo
echo "P.O.W.E.R. 2.0 project created successfully: $PROJECT_NAME"
echo
echo "Next steps:"
printf '  cd "%s"\n' "$PROJECT_NAME"
echo "  cp .env.example .env"
echo "  node bin/power-cli.js serve"
echo
echo "Note: configure your database in .env before using database-backed features."
