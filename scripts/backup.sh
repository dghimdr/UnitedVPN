#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

require_root
load_config

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

STAMP="$(date -u '+%Y%m%dT%H%M%SZ')"
BACKUP_FILE="$BACKUP_DIR/wireguard-${STAMP}.tar.gz"

tar --create --gzip --file "$BACKUP_FILE" \
  --warning=no-file-changed \
  --directory / \
  "${WG_DIR#/}"

chmod 600 "$BACKUP_FILE"

if [[ ! -s "$BACKUP_FILE" ]]; then
  echo "Backup failed or produced an empty file: $BACKUP_FILE" >&2
  exit 1
fi

echo "Backup created: $BACKUP_FILE"
echo "Copy it off-server and store it encrypted."
