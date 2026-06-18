# Operations Guide

## Affected System Areas

- Files: `/etc/wireguard/wg0.conf`, `/etc/wireguard/vpn.env`, `/etc/wireguard/uk.env`, `/etc/wireguard/clients`, `/etc/wireguard/clients-uk`
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

## Add a UK User

Run this only on `vpn-uk-london-1` or on an agent host that is operating against the UK `wg0` interface. This does not install or modify UFW.

```bash
sudo install -m 600 config/uk.env.example /etc/wireguard/uk.env
sudo bash scripts/add-uk-user.sh <vpn_username>
sudo qrencode -t ansiutf8 < /etc/wireguard/clients-uk/<vpn_username>/<vpn_username>.conf
```

The UK allocator starts at `10.9.0.3` because `10.9.0.2` is reserved for the manual David test client. The script also checks existing `AllowedIPs` in `wg0.conf` before assigning an address.

Keep `ENABLE_UK_REGION=false` in Vercel until a real approved user's UK config has been generated, downloaded or scanned through the dashboard, and confirmed to show a London public IP.

## Remove a User

```bash
sudo bash scripts/remove-user.sh alice
```

For UK only:

```bash
sudo bash scripts/remove-uk-user.sh alice
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

## UK Dashboard Verification Checklist

- Confirm `ENABLE_UK_REGION=false` before the first UK user asset is generated.
- Generate one UK config for David's real `vpn_username` with `sudo bash scripts/add-uk-user.sh <david_vpn_username>`.
- Confirm `/etc/wireguard/clients-uk/<david_vpn_username>/<david_vpn_username>.conf` and `.png` exist and are `600`.
- Confirm `sudo wg show wg0` on the UK node lists David's UK peer.
- Set `WIREGUARD_UK_CLIENTS_DIR=/etc/wireguard/clients-uk` for the VPS agent path that serves UK assets.
- Temporarily keep `ENABLE_UK_REGION=false` while testing the backend asset path directly.
- After backend asset access is confirmed, set the required Vercel UK env vars and `ENABLE_UK_REGION=true`.
- Log in as David, open the dashboard, choose United Kingdom, and download or scan the UK profile.
- Activate only `UNITEDVPN UK` in WireGuard.
- Confirm the public IP geolocates to London.
- If the dashboard test fails, set `ENABLE_UK_REGION=false` again before investigating.

## Deployment Checklist

- Repository is private.
- VPS is in Singapore.
- UK VPS remains separate from Singapore and uses `10.9.0.0/24`.
- DNS record points to the Singapore VPS if using `SERVER_DNS_NAME`.
- SSH key login works.
- SSH password login is disabled.
- Backups are configured and copied off-server.
- Update process is documented for whoever administers the server.
