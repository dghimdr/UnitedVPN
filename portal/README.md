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
- `/api/vpn/qr?region=sg`: approved user's Singapore WireGuard QR PNG.
- `/api/vpn/config?region=sg`: approved user's Singapore WireGuard `.conf` download.
- `/api/vpn/qr?region=uk`: approved user's United Kingdom WireGuard QR PNG when UK is enabled.
- `/api/vpn/config?region=uk`: approved user's United Kingdom WireGuard `.conf` download when UK is enabled.

Requests without `region` default to Singapore for backwards compatibility.

## Architecture

See `docs/architecture.md`.
