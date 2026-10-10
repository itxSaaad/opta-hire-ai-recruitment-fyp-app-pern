# Vercel environment mapping

Unified project: `opta-hire-ai-recruitment-fyp-app-pern`. Production domain: `opta-hire-fyp.vercel.app`; shared Preview alias: `dev-opta-hire-fyp.vercel.app`.

| Setting | Production | Preview | Notes |
| --- | --- | --- | --- |
| `CLIENT_URL`, `VITE_CLIENT_URL` | Production host | Preview alias | Canonical URLs and CORS |
| `DATABASE_URL` | Shared Supabase pooler | Same shared pooler | Generic environment scopes; credential temporarily unchanged |
| `SUPABASE_DB_CA` | Supabase CA PEM | Same CA PEM | Secret env setting, not a workstation path |
| JWT values | Existing configured values | Shared values | Keep private and stable as intended |
| Stripe settings | Existing account/mode | Shared settings | Preview actions may reach real integrations |
| SMTP settings | Existing provider | Shared settings | Preview mail may reach real recipients |
| `ML_SERVICES_URL` | Vercel binding | Vercel binding | Do not upload machine-specific URL |
| `VITE_*` | Public build config | Public build config | Never use for secrets |

Tracked examples contain variable names and placeholders only. Keep actual values in private local storage and Vercel settings; do not expose them in CLI output. Use the generic Production and Preview scopes only, and redeploy after edits because deployments retain the environment values captured at build time. Production and Preview currently share database, Stripe, and SMTP integrations, so Preview can cause real external effects. Rotate shared credentials by updating both Vercel scopes and private local settings together.
