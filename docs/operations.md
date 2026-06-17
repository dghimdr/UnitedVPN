# Operations Guide

## Affected System Areas

- Files: `/etc/wireguard/wg0.conf`, `/etc/wireguard/vpn.env`, `/etc/wireguard/clients`
- Service: `wg-quick@wg0`
- Firewall: UFW rules for SSH, WireGuard UDP, and routed VPN traffic
- Kernel: IPv4 forwarding through `/etc/sysctl.d/99-wireguard-vpn.conf`
- Data flow: client device -> WireGuard UDP endpoint -> `wg0` -> NAT through VPS public interface
- Environment/config values: public endpoint, public interface, WireGuard port, SSH port, VPN CIDR, DNS, user IP range

## Install

```bash
sudo apt update
sudo apt install -y git
git clone <your-private-repo-url> private-vpn
cd private-vpn
cp config/vpn.env.example config/vpn.env
nano config/vpn.env
sudo bash scripts/install-server.sh
```

Before running the install script:

- Confirm the VPS is Ubuntu 24.04.
- Confirm the VPS region is Singapore in your cloud provider dashboard.
- Set `SERVER_PUBLIC_IP` to the Singapore VPS public IP, or set `SERVER_DNS_NAME`.
- Confirm `SSH_PORT` before enabling UFW.
- Use a dedicated VPS. The install script resets UFW rules.

## Add a User

```bash
sudo bash scripts/add-user.sh alice
sudo qrencode -t ansiutf8 < /etc/wireguard/clients/alice/alice.conf
```

Scan the QR code from the official WireGuard app on iPhone or Android.

## Remove a User

```bash
sudo bash scripts/remove-user.sh alice
```

Removed client configs are moved under:

```text
/etc/wireguard/clients/removed/
```

Keep the archive briefly for audit purposes, then delete securely if no longer needed.

## List Users

```bash
sudo bash scripts/list-users.sh
```

## Test Checklist

- SSH remains connected after `scripts/install-server.sh`.
- `sudo systemctl status wg-quick@wg0` is active.
- `sudo ufw status verbose` shows SSH and WireGuard UDP allowed.
- `sudo wg show` shows the server interface.
- Add one test user and scan the QR code on mobile.
- Mobile client connects over cellular data.
- Mobile public IP changes to the Singapore VPS IP.
- DNS works on mobile after connecting.
- Removing the test user prevents reconnecting.

## Deployment Checklist

- Repository is private.
- VPS is in Singapore.
- DNS record points to the Singapore VPS if using `SERVER_DNS_NAME`.
- SSH key login works.
- SSH password login is disabled.
- Backups are configured and copied off-server.
- Update process is documented for whoever administers the server.
