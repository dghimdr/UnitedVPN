# UnitedVPN VPS Agent

Small localhost-only Node service for the UnitedVPN Portal.

It accepts HMAC-signed requests from the Vercel-hosted portal and runs the existing WireGuard scripts:

- `scripts/add-user.sh`
- `scripts/remove-user.sh`

It can also stream one approved user's generated files:

- `/etc/wireguard/clients/<username>/<username>.conf`
- `/etc/wireguard/clients/<username>/<username>.png`

## Local Start

```bash
cp .env.example .env
set -a
. ./.env
set +a
npm start
```

In production, run it with systemd and put HTTPS reverse proxy in front of `127.0.0.1:8787`.

See `../portal/docs/architecture.md` for deployment and security details.
