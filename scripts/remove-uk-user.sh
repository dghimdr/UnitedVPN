#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${CONFIG_FILE:-/etc/wireguard/uk.env}"
LOCAL_CONFIG_FILE="${LOCAL_CONFIG_FILE:-$(cd "$SCRIPT_DIR/.." && pwd)/config/uk.env}"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

require_root
load_config
acquire_user_lock

USERNAME="${1:-}"
if [[ -z "$USERNAME" ]]; then
  echo "Usage: sudo bash scripts/remove-uk-user.sh <username>" >&2
  exit 1
fi

validate_username "$USERNAME"
ensure_state_file

if ! user_exists "$USERNAME"; then
  echo "UK user not found: $USERNAME" >&2
  exit 1
fi

PUBLIC_KEY="$(awk -F '\t' -v user="$USERNAME" 'NR > 1 && $1 == user { print $3; exit }' "$STATE_FILE")"

if [[ -n "$PUBLIC_KEY" ]]; then
  wg set "$WG_INTERFACE" peer "$PUBLIC_KEY" remove 2>/dev/null || true
fi

TMP_CONF="$(mktemp)"
awk -v user="$USERNAME" '
  $0 == "# BEGIN_PEER " user { skip=1; next }
  $0 == "# END_PEER " user { skip=0; next }
  skip != 1 { print }
' "$WG_DIR/${WG_INTERFACE}.conf" > "$TMP_CONF"
install -m 600 "$TMP_CONF" "$WG_DIR/${WG_INTERFACE}.conf"
rm -f "$TMP_CONF"

TMP_STATE="$(mktemp)"
awk -F '\t' -v user="$USERNAME" 'NR == 1 || $1 != user' "$STATE_FILE" > "$TMP_STATE"
install -m 600 "$TMP_STATE" "$STATE_FILE"
rm -f "$TMP_STATE"

ARCHIVE_DIR="$CLIENTS_DIR/removed"
mkdir -p "$ARCHIVE_DIR"
chmod 700 "$ARCHIVE_DIR"
if [[ -d "$CLIENTS_DIR/$USERNAME" ]]; then
  mv "$CLIENTS_DIR/$USERNAME" "$ARCHIVE_DIR/${USERNAME}-$(date -u '+%Y%m%dT%H%M%SZ')"
fi

restart_wireguard

echo "Removed UK user: $USERNAME"
