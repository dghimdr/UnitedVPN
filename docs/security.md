# Security Guide

## Production Baseline

- Use Ubuntu 24.04 LTS.
- Use a Singapore VPS from a reputable provider.
- Use SSH keys only.
- Disable SSH password authentication.
- Keep WireGuard on UDP only.
- This setup is IPv4-only by default. Do not route `::/0` to clients unless you also add IPv6 addressing, forwarding, and firewall rules.
- Keep `/etc/wireguard` owned by root with restrictive permissions.
- Keep this repository private.
- Never commit generated client configs, private keys, QR codes, or backups.

## SSH Hardening

Edit SSH server config:

```bash
sudo nano /etc/ssh/sshd_config
```

Recommended settings:

```text
PermitRootLogin prohibit-password
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
```

Restart SSH:

```bash
sudo systemctl restart ssh
```

Keep one existing SSH session open while testing a new login.

## Firewall Rules

The install script configures:

- deny incoming by default
- allow outgoing by default
- allow SSH TCP port
- allow WireGuard UDP port
- allow routed traffic from `wg0` to the public interface

Check:

```bash
sudo ufw status verbose
```

## Key Handling

- Server private key: `/etc/wireguard/server_private.key`
- Server public key: `/etc/wireguard/server_public.key`
- Client configs: `/etc/wireguard/clients/<username>/<username>.conf`
- QR codes: `/etc/wireguard/clients/<username>/<username>.png`

Anyone with a client config or QR code can connect as that client until removed.

## Privacy/Data Notes

This setup does not log browsing history. Standard system logs may show service events and connection metadata. Avoid adding packet logging unless there is a specific incident-response need.
