# Vercel environment mapping

Unified project: `opta-hire-ai-recruitment-fyp-app-pern`. Production domain: `opta-hire-fyp.vercel.app`; `develop` Preview domain: `dev-opta-hire-fyp.vercel.app`.

| Setting | Production | Preview (`develop`) | Notes |
| --- | --- | --- | --- |
| `CLIENT_URL`, `VITE_CLIENT_URL` | Production host | Develop host | Canonical URLs and CORS |
| `DATABASE_URL` | Shared Supabase pooler | Same shared pooler | Both scopes populated; credential temporarily unchanged |
| `SUPABASE_DB_CA` | Supabase CA PEM | Same CA PEM | Secret env setting, not a workstation path |
| JWT values | Existing configured values | Shared values | Keep private and stable as intended |
| Stripe settings | Existing account/mode | Shared settings | Preview actions may reach real integrations |
| SMTP settings | Existing provider | Shared settings | Preview mail may reach real recipients |
| `ML_SERVICES_URL` | Vercel binding | Vercel binding | Do not upload machine-specific URL |
| `VITE_*` | Public build config | Public build config | Never use for secrets |

`.env.production`/`.env.preview` are ignored source bundles; `*.example` files are safe templates. `vercel-env-import.ps1 -WhatIf` prints key names only. The importer streams values to CLI stdin and should not print them. Verify names/scopes without `--decrypt`. Redeploy after env edits because existing deployments retain their captured config. Rotate the shared DB credential later by updating both Vercel scopes and ignored local bundles together.
