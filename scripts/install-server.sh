#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

require_root
load_config
guard_ssh_access

PUBLIC_IFACE="$(detect_public_interface)"
ENDPOINT="$(endpoint_host)"

if [[ -z "$PUBLIC_IFACE" ]]; then
  echo "Could not detect public network interface. Set PUBLIC_INTERFACE in config/vpn.env." >&2
  exit 1
fi

apt update
apt install -y wireguard wireguard-tools qrencode ufw iptables curl

mkdir -p "$WG_DIR" "$CLIENTS_DIR"
chmod 700 "$WG_DIR" "$CLIENTS_DIR"

if [[ ! -f "$WG_DIR/server_private.key" ]]; then
  wg genkey | tee "$WG_DIR/server_private.key" | wg pubkey > "$WG_DIR/server_public.key"
  chmod 600 "$WG_DIR/server_private.key"
  chmod 644 "$WG_DIR/server_public.key"
fi

SERVER_PRIVATE_KEY="$(cat "$WG_DIR/server_private.key")"

cat > "$WG_DIR/${WG_INTERFACE}.conf" <<EOF
[Interface]
Address = ${SERVER_VPN_IP}
ListenPort = ${WG_PORT}
PrivateKey = ${SERVER_PRIVATE_KEY}
SaveConfig = false
PostUp = iptables -t nat -A POSTROUTING -s ${VPN_CIDR} -o ${PUBLIC_IFACE} -j MASQUERADE
PostDown = iptables -t nat -D POSTROUTING -s ${VPN_CIDR} -o ${PUBLIC_IFACE} -j MASQUERADE

EOF
chmod 600 "$WG_DIR/${WG_INTERFACE}.conf"

install -m 600 "$LOCAL_CONFIG_FILE" "$WG_DIR/vpn.env"
if [[ -z "${PUBLIC_INTERFACE:-}" ]]; then
  printf '\n# Auto-detected during install.\nPUBLIC_INTERFACE="%s"\n' "$PUBLIC_IFACE" >> "$WG_DIR/vpn.env"
fi

ensure_state_file

cat > /etc/sysctl.d/99-wireguard-vpn.conf <<EOF
net.ipv4.ip_forward=1
EOF
sysctl --system

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow "${SSH_PORT}/tcp"
ufw allow "${WG_PORT}/udp"
ufw route allow in on "$WG_INTERFACE" out on "$PUBLIC_IFACE"
ufw --force enable

systemctl enable "wg-quick@${WG_INTERFACE}"
systemctl restart "wg-quick@${WG_INTERFACE}"

echo "WireGuard installed."
echo "Endpoint: ${ENDPOINT}:${WG_PORT}"
echo "Interface: ${WG_INTERFACE}"
echo "Public interface: ${PUBLIC_IFACE}"
echo "Server public key: $(cat "$WG_DIR/server_public.key")"
