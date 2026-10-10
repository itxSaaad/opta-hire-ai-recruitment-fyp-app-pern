# Configuration

Local credentials belong in private per-service settings; tracked examples document variable names and placeholder values. Keep credentials in local secret storage and provider settings, never in source control or logs.

| Variable family | Consumer | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Node API | PostgreSQL URI; loader also supports `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_URL` |
| `SUPABASE_DB_CA_FILE` / `SUPABASE_DB_CA` | Node TLS | Local CA file path / hosted PEM contents |
| JWT secret and expiry | API | Session/token signing and lifetime |
| `CLIENT_URL`, `SERVER_URL`, `CORS_ORIGIN` | API and ML | Public origins and allowlist |
| Stripe secret/webhook secret | API | Server payments and signature verification |
| Stripe publishable key / `VITE_STRIPE_PUBLISHABLE_KEY` | Browser | Public Stripe.js integration |
| `NODEMAILER_SMTP_*` | API | SMTP transport for auth and notifications |
| `ML_SERVICES_URL` | API | Local Flask endpoint; hosted Vercel binding |
| `VITE_CLIENT_URL`, `VITE_GA_TRACKING_ID` | Client | Public build-time metadata/analytics |
| `MODEL_*`, `WEIGHT_*`, `MAX_CANDIDATES`, `MIN_SIMILARITY` | Flask | Model config, scoring, bounds |
| `BLOB_READ_WRITE_TOKEN` / `BLOB_STORE_ID` | Flask | Private Vercel Blob credentials injected by the connected model-artifact store; never copy into tracked files |
| `MODEL_ARTIFACT_BACKEND`, `MODEL_ARTIFACT_NAMESPACE` | Flask | Optional storage override; defaults to Blob when connected and isolates `production`, `preview`, and local `development` artifacts |
| `RATE_LIMIT_*` | API/Flask | In-memory limits; no Redis/Upstash variable is needed |
| `DISABLE_SCHEDULED_PAYOUTS` | API | Keep `true` until an authenticated, idempotent payout processor performs verified Stripe transfers and safe state transitions |

See [Vercel env scopes](../operations/environment-variables.md) and [model artifact storage](../services/model-artifact-storage.md). `VITE_*` values are public and build-time. Preview shares database, payment and mail integrations with Production, so it can produce real effects; ML artifacts are isolated by environment inside the shared private Blob store.
