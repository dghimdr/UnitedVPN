# Private WireGuard VPN

Simple production-ready WireGuard setup for an Ubuntu 24.04 VPS in Singapore, sized for up to 20 trusted users.

## What this project creates

- WireGuard server on `wg0`
- UFW firewall with SSH and WireGuard access
- NAT and IPv4 forwarding for client internet traffic
- Automatic client config generation
- QR code PNG generation for iPhone and Android
- Easy add, remove, and list user scripts
- Backup, update, and monitoring helpers
- Operator documentation

## Project Structure

```text
.
├── README.md
├── config/
│   ├── vpn.env.example
│   └── wg0.conf.example
├── docs/
│   ├── backup.md
│   ├── monitoring.md
│   ├── operations.md
│   ├── security.md
│   └── updates.md
└── scripts/
    ├── add-user.sh
    ├── backup.sh
    ├── install-server.sh
    ├── lib.sh
    ├── list-users.sh
    ├── monitor.sh
    ├── remove-user.sh
    └── update-server.sh
```

## Quick Start

On the Ubuntu 24.04 VPS:

```bash
sudo apt update
sudo apt install -y git
git clone <your-private-repo-url> private-vpn
cd private-vpn
cp config/vpn.env.example config/vpn.env
nano config/vpn.env
sudo bash scripts/install-server.sh
sudo bash scripts/add-user.sh david
```

Before running `install-server.sh`, confirm `SSH_PORT` in `config/vpn.env` matches the port you are currently using for SSH. Keep your current SSH session open until a second SSH login succeeds after installation.

The generated client files are written to:

```text
/etc/wireguard/clients/<username>/<username>.conf
/etc/wireguard/clients/<username>/<username>.png
```

Show the QR code in the terminal:

```bash
sudo qrencode -t ansiutf8 < /etc/wireguard/clients/david/david.conf
```

## Important Defaults

- VPN network: `10.8.0.0/24`
- Server VPN IP: `10.8.0.1`
- Client IP range: `10.8.0.2` to `10.8.0.21`
- Max users: `20`
- WireGuard port: `51820/udp`
- Client routing: IPv4 full tunnel, `0.0.0.0/0`

## Daily Commands

```bash
sudo bash scripts/list-users.sh
sudo bash scripts/add-user.sh alice
sudo bash scripts/remove-user.sh alice
sudo bash scripts/monitor.sh
sudo bash scripts/backup.sh
sudo bash scripts/update-server.sh
```

## Security Notes

- Keep this repository private.
- Never commit generated private keys or client configs.
- Restrict SSH with strong keys and disable password SSH login.
- Keep `/etc/wireguard` readable only by root.
- Use a VPS in Singapore and verify the public IP before installation.

See [docs/security.md](docs/security.md), [docs/operations.md](docs/operations.md), [docs/backup.md](docs/backup.md), [docs/updates.md](docs/updates.md), and [docs/monitoring.md](docs/monitoring.md).
