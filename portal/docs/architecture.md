# UnitedVPN Portal v0.1 Architecture

## Safest Architecture

UnitedVPN Portal should keep identity, approval state, and VPN key material in separate trust zones.

1. Supabase Auth handles email and password signup/login.
2. Supabase Postgres stores only portal metadata: email, role, status, generated VPN username, and timestamps.
3. Vercel hosts the Next.js portal and server routes.
4. The Ubuntu VPS remains the only place that can generate WireGuard peers, read client configs, show QR PNGs, or revoke peers.
5. A small VPS-side agent accepts signed requests from Vercel, validates HMAC and timestamps, then runs the existing scripts.

Vercel must never store WireGuard configs, server private keys, or other users' files. It only streams the signed-in approved user's own config or QR from the VPS agent.

## Affected Files And Flows

- `portal/app/auth/*`: email/password signup and login.
- `portal/app/dashboard/page.tsx`: pending, approved, and revoked user states.
- `portal/app/admin/page.tsx`: manual approval and revoke UI.
- `portal/app/api/admin/*`: server-only admin approval and revocation actions.
- `portal/app/api/user/*`: approved-user QR and `.conf` streaming.
- `portal/supabase/schema.sql`: profiles table, RLS, admin checks, and 20 approved-user cap.
- `vps-agent/server.js`: signed API on the VPS that runs WireGuard scripts and streams files.
- Existing VPS scripts: `scripts/add-user.sh`, `scripts/remove-user.sh`, `scripts/list-users.sh`.

## Database Schema

Apply `portal/supabase/schema.sql` in Supabase SQL editor.

Important fields:

- `profiles.id`: Supabase Auth user id.
- `profiles.email`: account email.
- `profiles.role`: `user` or `admin`.
- `profiles.status`: `pending`, `approved`, or `revoked`.
- `profiles.vpn_username`: safe shell username generated from the Auth user id.
- `profiles.approved_at`, `profiles.provisioned_at`, `profiles.revoked_at`: audit timestamps.

No WireGuard private keys, client configs, QR images, or server private keys are stored in Supabase.

## Supabase Auth Flow

1. User signs up with email and password.
2. Supabase trigger creates `profiles` row with `status = pending` and `role = user`.
3. Admin reviews pending users in `/admin`.
4. Admin approval calls the VPS agent and only marks the DB row approved after provisioning succeeds.
5. Approved users can access `/dashboard`, `/api/user/qr`, and `/api/user/config`.
6. Revoked users lose dashboard asset access, and the peer is removed from the VPS immediately.

Bootstrap the first admin manually after that account signs up:

```sql
update public.profiles
set role = 'admin'
where email = 'david@example.com';
```

## User Dashboard

The user dashboard shows:

- `pending`: approval notice, no VPN files.
- `approved`: QR for iPhone/Android and `.conf` download for Mac/Windows.
- `revoked`: revoked notice, no VPN files.

The QR and config endpoints re-check Supabase Auth and the user's profile status on every request.

## Admin Dashboard

The admin dashboard shows all profiles and supports:

- approve pending user
- revoke approved user
- approved-user count against the 20-user limit

The UI is intentionally minimal for v0.1. Admin routes use a Supabase service role client on the server only.

## Secure Vercel-To-VPS API

Requests from Vercel to the VPS agent include:

- `x-unitedvpn-timestamp`
- `x-unitedvpn-signature`

Signature payload:

```text
<timestamp>.<method>.<path>.<body>
```

The signature is `HMAC-SHA256` with `VPS_AGENT_SHARED_SECRET`.

The VPS agent:

- rejects missing, stale, or invalid signatures
- accepts only safe usernames matching `^[a-zA-Z0-9_-]{1,32}$`
- runs only `add-user.sh` and `remove-user.sh`
- streams only `/etc/wireguard/clients/<username>/<username>.conf`
- streams only `/etc/wireguard/clients/<username>/<username>.png`
- never exposes server private keys or other user paths

## Approval Flow

1. Admin clicks approve.
2. Vercel verifies the current user is admin.
3. Vercel checks approved count is below 20.
4. Vercel generates `vpn_username` from the Auth user id.
5. Vercel calls `POST /v1/provision` on the VPS agent.
6. VPS agent runs `sudo bash scripts/add-user.sh <vpn_username>`.
7. If provisioning succeeds, Vercel updates the profile to `approved`.

If provisioning fails, the database remains pending.

## Revoke / Remove Flow

1. Admin clicks revoke.
2. Vercel verifies admin.
3. Vercel calls `POST /v1/revoke`.
4. VPS agent runs `sudo bash scripts/remove-user.sh <vpn_username>`.
5. The script removes the live WireGuard peer, updates `wg0.conf`, archives client files, and restarts WireGuard.
6. Vercel marks the profile `revoked`.

Revoked users cannot fetch QR or config because the dashboard API checks `status = approved`.

## QR Display Flow

1. Browser requests `/api/user/qr`.
2. Vercel checks Supabase session and `profiles.status = approved`.
3. Vercel calls `GET /v1/client/<vpn_username>/qr`.
4. VPS agent streams the PNG from `/etc/wireguard/clients/<username>/<username>.png`.
5. Vercel returns `image/png` with `cache-control: no-store`.

## Config Download Flow

1. Browser requests `/api/user/config`.
2. Vercel checks Supabase session and `profiles.status = approved`.
3. Vercel calls `GET /v1/client/<vpn_username>/config`.
4. VPS agent streams the `.conf` file from the user's own client directory.
5. Vercel returns an attachment with `cache-control: no-store`.

## Environment Variables

Vercel:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VPS_AGENT_BASE_URL=https://vpn-agent.example.com
VPS_AGENT_SHARED_SECRET=
```

VPS agent:

```text
PORT=8787
UNITEDVPN_SHARED_SECRET=
UNITEDVPN_REPO_DIR=/opt/UnitedVPN
WIREGUARD_CLIENTS_DIR=/etc/wireguard/clients
MAX_BODY_BYTES=4096
```

Use the same random 32+ byte secret for `VPS_AGENT_SHARED_SECRET` and `UNITEDVPN_SHARED_SECRET`.

## Deployment Instructions

### Supabase

1. Create a Supabase project.
2. Enable email/password auth.
3. Set Site URL to the Vercel production domain.
4. Add redirect URL: `https://<your-vercel-domain>/auth/callback`.
5. Run `portal/supabase/schema.sql`.
6. Sign up the first admin account.
7. Run the admin bootstrap SQL shown above.

### Vercel

1. Set project root to `portal`.
2. Add all Vercel environment variables.
3. Deploy.
4. Confirm `/auth/signup`, `/auth/login`, `/dashboard`, and `/admin` load.

### VPS Agent

Install Node 20+ and place this repo at `/opt/UnitedVPN`.

Create `/etc/unitedvpn-agent.env`:

```text
PORT=8787
UNITEDVPN_SHARED_SECRET=<same secret as Vercel>
UNITEDVPN_REPO_DIR=/opt/UnitedVPN
WIREGUARD_CLIENTS_DIR=/etc/wireguard/clients
```

Create `/etc/systemd/system/unitedvpn-agent.service`:

```ini
[Unit]
Description=UnitedVPN Portal Agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/opt/UnitedVPN/vps-agent
EnvironmentFile=/etc/unitedvpn-agent.env
ExecStart=/usr/bin/node /opt/UnitedVPN/vps-agent/server.js
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Start it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now unitedvpn-agent
```

Put Nginx or Caddy in front of `127.0.0.1:8787` with HTTPS. Do not expose the raw localhost service.

If the agent does not run as root, allow only these sudo commands with `NOPASSWD`:

```text
/bin/bash /opt/UnitedVPN/scripts/add-user.sh *
/bin/bash /opt/UnitedVPN/scripts/remove-user.sh *
```

## Security Checklist

- Supabase service role key exists only in Vercel server env, never client code.
- VPS agent shared secret is 32+ random bytes and rotated if leaked.
- VPS agent listens on `127.0.0.1`, not public interfaces.
- Public access goes through HTTPS reverse proxy.
- Agent endpoints reject stale timestamps and invalid HMAC.
- Usernames are generated from Auth ids and validated before shell execution.
- `/etc/wireguard` remains root-readable only.
- No server private key path is exposed by the agent.
- Config and QR responses use `cache-control: no-store`.
- Revocation runs the existing `remove-user.sh` and removes the live peer immediately.
- Supabase RLS is enabled on `profiles`.
- Admin role is assigned manually only to trusted accounts.
- Approved-user cap is enforced in both API and database trigger.
- Test on mobile viewport before sharing the portal with users.
