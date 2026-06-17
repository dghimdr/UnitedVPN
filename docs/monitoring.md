# Monitoring Guide

## Quick Health Check

```bash
sudo bash scripts/monitor.sh
```

This reports:

- host uptime
- WireGuard service state
- WireGuard peers and handshakes
- UFW firewall status
- UDP listener
- disk usage
- memory usage

## Useful Commands

```bash
sudo systemctl status wg-quick@wg0
sudo wg show
sudo ufw status verbose
sudo journalctl -u wg-quick@wg0 --since "1 hour ago"
df -h /
free -h
```

## What to Watch

- `latest handshake`: should update when a client is actively connected.
- `transfer`: should increase when the client is sending traffic.
- disk usage: keep root filesystem below 80%.
- memory: small VPS instances are fine, but avoid sustained swap pressure.
- UFW: only SSH and WireGuard should be publicly reachable.

## Optional External Monitoring

Use a simple uptime monitor against SSH or a lightweight HTTPS endpoint if the VPS also hosts one. Do not expose a new monitoring dashboard just for this VPN unless you need it.

## Incident Checklist

- Confirm the VPS provider dashboard shows the server is running in Singapore.
- Confirm the public IP has not changed.
- Confirm DNS points to the current public IP if using a hostname.
- Confirm `wg-quick@wg0` is active.
- Confirm UFW allows the WireGuard UDP port.
- Confirm the client config endpoint matches the server.
- Remove and recreate a client if its config may be compromised.
