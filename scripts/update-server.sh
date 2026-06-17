#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

require_root
load_config

echo "Creating pre-update backup..."
bash "$SCRIPT_DIR/backup.sh"

apt update
apt upgrade -y
apt autoremove -y

systemctl restart "wg-quick@${WG_INTERFACE}"
systemctl --no-pager --full status "wg-quick@${WG_INTERFACE}" || true

if [[ -f /var/run/reboot-required ]]; then
  echo "Reboot required. Schedule a maintenance window, then run: sudo reboot"
else
  echo "No reboot required."
fi
