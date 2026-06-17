# UnitedVPN Portal v0.1

Private approval-based WireGuard portal for friends and family.

## Run Locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Apply `supabase/schema.sql` to a Supabase project before using the app.

## Key Routes

- `/auth/signup`: email/password signup.
- `/auth/login`: login.
- `/dashboard`: user VPN state, QR, and config download.
- `/admin`: manual approval and revocation.
- `/api/user/qr`: approved user's WireGuard QR PNG.
- `/api/user/config`: approved user's WireGuard `.conf` download.

## Architecture

See `docs/architecture.md`.
