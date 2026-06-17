#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

load_config

if [[ ! -f "$STATE_FILE" ]]; then
  echo "No users found. State file does not exist: $STATE_FILE"
  exit 0
fi

column -t -s $'\t' "$STATE_FILE"
