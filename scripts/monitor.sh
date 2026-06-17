#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

load_config

echo "== Host =="
hostnamectl --static
uptime

echo
echo "== WireGuard service =="
systemctl is-active "wg-quick@${WG_INTERFACE}" || true
systemctl is-enabled "wg-quick@${WG_INTERFACE}" || true

echo
echo "== WireGuard peers =="
if command -v wg >/dev/null 2>&1; then
  wg show "$WG_INTERFACE" || true
else
  echo "wg command not installed"
fi

echo
echo "== Firewall =="
if command -v ufw >/dev/null 2>&1; then
  ufw status verbose || true
else
  echo "ufw command not installed"
fi

echo
echo "== Listening UDP port =="
ss -lunp | grep ":${WG_PORT} " || true

echo
echo "== Disk =="
df -h /

echo
echo "== Memory =="
free -h
