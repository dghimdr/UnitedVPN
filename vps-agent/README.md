# UnitedVPN VPS Agent

Small localhost-only Node service for the UnitedVPN Portal.

It accepts HMAC-signed requests from the Vercel-hosted portal and runs the existing WireGuard scripts:

- `scripts/add-user.sh`
- `scripts/remove-user.sh`
- `scripts/add-uk-user.sh`
- `scripts/remove-uk-user.sh`

It can also stream one approved user's generated files:

- `/etc/wireguard/clients/<username>/<username>.conf`
- `/etc/wireguard/clients/<username>/<username>.png`

Region-aware asset routes are supported for separate WireGuard profiles:

- `GET /v1/client/<username>/config` and `GET /v1/client/<username>/qr` keep the existing Singapore flow.
- `GET /v1/client/<username>/uk/config` and `GET /v1/client/<username>/uk/qr` stream UK client files from `WIREGUARD_UK_CLIENTS_DIR`.
- `POST /v1/provision/uk` creates only UK assets and the UK peer for an existing approved user.
- `POST /v1/revoke/uk` removes only the UK peer and archives UK assets.

`POST /v1/provision` and `POST /v1/revoke` remain Singapore-only unless `ENABLE_UK_PROVISIONING=true` is set in the agent environment.

## Local Start

```bash
cp .env.example .env
set -a
. ./.env
set +a
npm start
```

In production, run it with systemd and put HTTPS reverse proxy in front of `127.0.0.1:8787`.

Relevant environment variables:

```text
PORT=8787
UNITEDVPN_SHARED_SECRET=
UNITEDVPN_REPO_DIR=/opt/UnitedVPN
WIREGUARD_CLIENTS_DIR=/etc/wireguard/clients
WIREGUARD_SG_CLIENTS_DIR=/etc/wireguard/clients
WIREGUARD_UK_CLIENTS_DIR=/etc/wireguard/clients-uk
ENABLE_UK_PROVISIONING=false
MAX_BODY_BYTES=4096
```

Keep `ENABLE_UK_PROVISIONING=false` until the UK agent path has been tested with a real approved user's UK config. `ENABLE_UK_REGION` in Vercel should also stay `false` until the dashboard scan/download flow is confirmed.

See `../portal/docs/architecture.md` for deployment and security details.
