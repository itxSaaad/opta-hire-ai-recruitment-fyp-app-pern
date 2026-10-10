# Security practices

- Validate sessions, roles and record ownership server-side for every protected read/write. Client guards are not authorization.
- Keep DB/JWT/Stripe secret/webhook/SMTP credentials in server env or provider secret stores. `VITE_*` is public.
- Verify Supabase TLS using the supplied CA; do not disable certificate validation.
- Verify Stripe signatures over raw webhook bytes; design event handlers for duplicate delivery.
- Keep credentials, tokens, database URLs, personal data and full payloads out of logs. `.env.production`, `.env.preview`, `.opta-migration/`, dumps and local envs must remain ignored.
- Bound body/upload/search/ML sizes. Memory rate limits are per process, not global.
- Authenticate socket handshakes and authorize room membership; transient presence disappears on restart.

See [realtime controls](../api/realtime.md), [deployment](../operations/deployment.md), and [incident response](../operations/incident-response.md).
