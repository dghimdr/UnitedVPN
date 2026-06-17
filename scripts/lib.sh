#!/usr/bin/env bash
set -euo pipefail

CONFIG_FILE="${CONFIG_FILE:-/etc/wireguard/vpn.env}"
LOCAL_CONFIG_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/config/vpn.env"

load_config() {
  if [[ -f "$CONFIG_FILE" ]]; then
    # shellcheck disable=SC1090
    source "$CONFIG_FILE"
  elif [[ -f "$LOCAL_CONFIG_FILE" ]]; then
    # shellcheck disable=SC1090
    source "$LOCAL_CONFIG_FILE"
  else
    echo "Missing config. Copy config/vpn.env.example to config/vpn.env and edit it first." >&2
    exit 1
  fi

  WG_INTERFACE="${WG_INTERFACE:-wg0}"
  WG_PORT="${WG_PORT:-51820}"
  VPN_CIDR="${VPN_CIDR:-10.8.0.0/24}"
  SERVER_VPN_IP="${SERVER_VPN_IP:-10.8.0.1/24}"
  SERVER_VPN_IP_SHORT="${SERVER_VPN_IP_SHORT:-10.8.0.1}"
  CLIENT_DNS="${CLIENT_DNS:-1.1.1.1, 1.0.0.1}"
  CLIENT_ALLOWED_IPS="${CLIENT_ALLOWED_IPS:-0.0.0.0/0}"
  CLIENT_PERSISTENT_KEEPALIVE="${CLIENT_PERSISTENT_KEEPALIVE:-25}"
  CLIENT_IP_START="${CLIENT_IP_START:-2}"
  CLIENT_IP_END="${CLIENT_IP_END:-21}"
  MAX_USERS="${MAX_USERS:-20}"
  SSH_PORT="${SSH_PORT:-22}"
  WG_DIR="${WG_DIR:-/etc/wireguard}"
  CLIENTS_DIR="${CLIENTS_DIR:-/etc/wireguard/clients}"
  STATE_FILE="${STATE_FILE:-/etc/wireguard/clients/peers.tsv}"
  BACKUP_DIR="${BACKUP_DIR:-/root/wireguard-backups}"
}

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    echo "Run as root: sudo bash $0" >&2
    exit 1
  fi
}

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Required command not found: $cmd" >&2
    exit 1
  fi
}

validate_port() {
  local port="$1"
  if [[ ! "$port" =~ ^[0-9]+$ ]] || (( port < 1 || port > 65535 )); then
    echo "Invalid port: $port" >&2
    exit 1
  fi
}

guard_ssh_access() {
  validate_port "$SSH_PORT"
  validate_port "$WG_PORT"

  if [[ -n "${SSH_CONNECTION:-}" ]]; then
    local active_ssh_port
    active_ssh_port="$(printf '%s\n' "$SSH_CONNECTION" | awk '{print $4}')"
    if [[ "$active_ssh_port" != "$SSH_PORT" && "${ALLOW_SSH_PORT_MISMATCH:-}" != "1" ]]; then
      echo "Refusing to enable UFW because SSH_PORT=$SSH_PORT but this SSH session is connected to port $active_ssh_port." >&2
      echo "Set SSH_PORT=$active_ssh_port in config/vpn.env, or rerun with ALLOW_SSH_PORT_MISMATCH=1 from a console you can recover." >&2
      exit 1
    fi
  fi
}

acquire_user_lock() {
  require_command flock
  mkdir -p "$WG_DIR"
  exec 9>"$WG_DIR/.vpn-users.lock"
  flock -x 9
}

validate_username() {
  local username="$1"
  if [[ ! "$username" =~ ^[a-zA-Z0-9_-]{1,32}$ ]]; then
    echo "Invalid username. Use 1-32 characters: letters, numbers, underscore, hyphen." >&2
    exit 1
  fi
}

endpoint_host() {
  if [[ -n "${SERVER_DNS_NAME:-}" ]]; then
    echo "$SERVER_DNS_NAME"
  elif [[ -n "${SERVER_PUBLIC_IP:-}" ]]; then
    echo "$SERVER_PUBLIC_IP"
  else
    echo "SERVER_PUBLIC_IP or SERVER_DNS_NAME must be set." >&2
    exit 1
  fi
}

detect_public_interface() {
  if [[ -n "${PUBLIC_INTERFACE:-}" ]]; then
    echo "$PUBLIC_INTERFACE"
    return
  fi
  ip route show default | awk '{print $5; exit}'
}

ensure_state_file() {
  mkdir -p "$CLIENTS_DIR"
  chmod 700 "$CLIENTS_DIR"
  if [[ ! -f "$STATE_FILE" ]]; then
    printf "username\tip\tpublic_key\tcreated_at\n" > "$STATE_FILE"
    chmod 600 "$STATE_FILE"
  fi
}

user_exists() {
  local username="$1"
  [[ -f "$STATE_FILE" ]] && awk -F '\t' -v user="$username" 'NR > 1 && $1 == user { found=1 } END { exit !found }' "$STATE_FILE"
}

allocated_ip_exists() {
  local ip="$1"
  [[ -f "$STATE_FILE" ]] && awk -F '\t' -v ip="$ip" 'NR > 1 && $2 == ip { found=1 } END { exit !found }' "$STATE_FILE"
}

next_client_ip() {
  local prefix
  prefix="$(echo "$SERVER_VPN_IP_SHORT" | awk -F '.' '{print $1"."$2"."$3}')"

  local count
  count="$(awk -F '\t' 'NR > 1 { count++ } END { print count + 0 }' "$STATE_FILE")"
  if (( count >= MAX_USERS )); then
    echo "Maximum user count reached: $MAX_USERS" >&2
    exit 1
  fi

  local octet ip
  for (( octet=CLIENT_IP_START; octet<=CLIENT_IP_END; octet++ )); do
    ip="${prefix}.${octet}"
    if ! allocated_ip_exists "$ip"; then
      echo "$ip"
      return
    fi
  done

  echo "No free client IPs available in configured range." >&2
  exit 1
}

restart_wireguard() {
  systemctl restart "wg-quick@${WG_INTERFACE}"
}
