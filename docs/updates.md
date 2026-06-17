# Update Guide

## Routine Updates

Run:

```bash
sudo bash scripts/update-server.sh
```

The script:

- creates a pre-update backup
- runs `apt update`
- runs `apt upgrade -y`
- removes unused packages
- restarts WireGuard
- reports whether reboot is required

## Manual Update Commands

```bash
sudo bash scripts/backup.sh
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
sudo systemctl restart wg-quick@wg0
sudo systemctl status wg-quick@wg0
```

## Reboot

If required:

```bash
sudo reboot
```

After reboot:

```bash
sudo systemctl status wg-quick@wg0
sudo wg show
sudo ufw status verbose
```

## Update Checklist

- Backup completed before package upgrades.
- SSH session remains stable.
- WireGuard service is active after update.
- At least one client can connect after update.
- Reboot completed if `/var/run/reboot-required` existed.
