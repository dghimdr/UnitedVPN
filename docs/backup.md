# Backup Guide

## What to Back Up

Back up:

- `/etc/wireguard/wg0.conf`
- `/etc/wireguard/vpn.env`
- `/etc/wireguard/server_private.key`
- `/etc/wireguard/server_public.key`
- `/etc/wireguard/clients/peers.tsv`
- active client configs and QR codes if you want easy device restore

These files contain secrets. Treat every backup as sensitive.

## Create a Backup

```bash
sudo bash scripts/backup.sh
```

Backups are written to:

```text
/root/wireguard-backups/
```

## Off-Server Backup

Copy the backup to your local machine:

```bash
scp root@<server-ip>:/root/wireguard-backups/wireguard-YYYYMMDDTHHMMSSZ.tar.gz .
```

Store it in an encrypted password manager, encrypted drive, or secure cloud storage.

## Restore

On a replacement Ubuntu 24.04 VPS:

```bash
sudo apt update
sudo apt install -y wireguard wireguard-tools qrencode ufw iptables
sudo tar -xzf wireguard-YYYYMMDDTHHMMSSZ.tar.gz -C /
sudo sysctl -w net.ipv4.ip_forward=1
sudo systemctl enable wg-quick@wg0
sudo systemctl restart wg-quick@wg0
```

If the public IP or DNS changed, update:

```text
/etc/wireguard/vpn.env
```

Then regenerate or manually update client configs with the new endpoint.

## Test Checklist

- Backup file exists and is non-empty.
- Backup file permissions are `600`.
- Backup has been copied off-server.
- A restore has been tested on a disposable VPS before relying on it.
