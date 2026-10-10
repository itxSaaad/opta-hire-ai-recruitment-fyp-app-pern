# Deployment topology and current status

Root `vercel.json` configures `client`, `server`, and `ml-services` in one Vercel project. Exact `/api` and `/api/*` go to Node; `/socket.io/*` goes to Node; application paths go to the client. Node calls Flask through the service binding. Production domain is `opta-hire-fyp.vercel.app`; `develop` Preview is `dev-opta-hire-fyp.vercel.app`.

## Verified configuration

- Vercel Production and Preview (`develop`) both now have the shared Supabase `DATABASE_URL` and CA value. The URL is intentionally omitted here.
- Local production/preview bundles target the Supabase pooler (`aws-0-us-east-1.pooler.supabase.com:6543`) with `sslmode=require`; current database credential remains unchanged at user's direction, with rotation planned later.
- Local client, API and ML health endpoints returned HTTP 200; API authenticated to Supabase with the configured CA. This validates process and dependency reachability, not complete product flows or hosted runtime.
- Heroku app `opta-hire-fyp-app-server` is active. Render CLI is installed. Neither legacy service is retired.

## Release and retirement sequence

Review Preview deployment/logs; verify API exact root path, API liveness, protected DB read, ML call, page routing and Socket.IO handshake; validate representative controlled flows. Complete final Heroku backup/import and reconcile data before directing production writes exclusively to Supabase. Monitor and preserve rollback; retire Heroku/Render only after acceptance and data verification.

`vercel-env-import.ps1` consumes ignored root bundles and assigns Preview values to Git branch `develop`. Preview shares database/Stripe/SMTP with Production, so it is not isolated and may cause real effects.
