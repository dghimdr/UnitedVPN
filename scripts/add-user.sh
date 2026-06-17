#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

require_root
load_config
require_command wg
require_command qrencode
acquire_user_lock

USERNAME="${1:-}"
if [[ -z "$USERNAME" ]]; then
  echo "Usage: sudo bash scripts/add-user.sh <username>" >&2
  exit 1
fi

validate_username "$USERNAME"
ensure_state_file

if user_exists "$USERNAME"; then
  echo "User already exists: $USERNAME" >&2
  exit 1
fi

CLIENT_IP="$(next_client_ip)"
USER_DIR="$CLIENTS_DIR/$USERNAME"
mkdir -p "$USER_DIR"
chmod 700 "$USER_DIR"

CLIENT_PRIVATE_KEY="$(wg genkey)"
CLIENT_PUBLIC_KEY="$(printf '%s' "$CLIENT_PRIVATE_KEY" | wg pubkey)"
SERVER_PUBLIC_KEY="$(cat "$WG_DIR/server_public.key")"
ENDPOINT="$(endpoint_host)"
CREATED_AT="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"

cat > "$USER_DIR/$USERNAME.conf" <<EOF
[Interface]
PrivateKey = ${CLIENT_PRIVATE_KEY}
Address = ${CLIENT_IP}/32
DNS = ${CLIENT_DNS}

[Peer]
PublicKey = ${SERVER_PUBLIC_KEY}
Endpoint = ${ENDPOINT}:${WG_PORT}
AllowedIPs = ${CLIENT_ALLOWED_IPS}
PersistentKeepalive = ${CLIENT_PERSISTENT_KEEPALIVE}
EOF
chmod 600 "$USER_DIR/$USERNAME.conf"

qrencode -o "$USER_DIR/$USERNAME.png" -t png < "$USER_DIR/$USERNAME.conf"
chmod 600 "$USER_DIR/$USERNAME.png"

cat >> "$WG_DIR/${WG_INTERFACE}.conf" <<EOF
# BEGIN_PEER ${USERNAME}
[Peer]
# Name = ${USERNAME}
# CreatedAt = ${CREATED_AT}
PublicKey = ${CLIENT_PUBLIC_KEY}
AllowedIPs = ${CLIENT_IP}/32
# END_PEER ${USERNAME}

EOF

printf "%s\t%s\t%s\t%s\n" "$USERNAME" "$CLIENT_IP" "$CLIENT_PUBLIC_KEY" "$CREATED_AT" >> "$STATE_FILE"
chmod 600 "$STATE_FILE"

wg set "$WG_INTERFACE" peer "$CLIENT_PUBLIC_KEY" allowed-ips "${CLIENT_IP}/32" || restart_wireguard

echo "Created user: $USERNAME"
echo "Client config: $USER_DIR/$USERNAME.conf"
echo "QR PNG: $USER_DIR/$USERNAME.png"
echo "Show QR in terminal:"
echo "sudo qrencode -t ansiutf8 < $USER_DIR/$USERNAME.conf"
