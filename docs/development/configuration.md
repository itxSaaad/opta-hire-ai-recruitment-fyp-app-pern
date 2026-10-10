# Configuration

Local secrets belong in ignored per-service `.env` files; examples contain names/placeholders only. Real root `.env.production` and `.env.preview` are ignored import bundles consumed by `vercel-env-import.ps1`. Never stage bundles or print their contents.

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
| `RATE_LIMIT_*` | API/Flask | In-memory limits; no Redis/Upstash variable is needed |

See [Vercel env scopes](../operations/environment-variables.md). `VITE_*` values are public and build-time. Preview shares database, payment and mail integrations with Production, so it can produce real effects.
