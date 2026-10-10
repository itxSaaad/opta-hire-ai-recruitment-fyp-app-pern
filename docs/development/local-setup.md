# Local setup

## Requirements and processes

Use Node/npm compatible with lockfiles (API targets Node 24.x), Python 3.12.13 with uv, PostgreSQL access, and test credentials for external flows. Configure each service from its tracked example and provide private values locally.

```powershell
cd client; npm install; npm run dev
cd server; npm install; npm run dev
cd ml-services; uv sync --frozen; uv run --frozen python app.py
```

Typical ports: client 5173, API 5000, Flask 5001. Set API `ML_SERVICES_URL=http://localhost:5001/`. Local Vite proxy config may differ from Vercel rewrites; inspect it rather than assuming hosted routing applies on localhost.

## Smoke checks

1. Open `http://localhost:5173/` and confirm assets load.
2. `GET http://localhost:5000/api` and `/api/v1/test` checks API routing/liveness.
3. `GET http://localhost:5001/api/v1/health/` and `/api/v1/health/ai-service` checks Flask/model readiness.
4. Verify sanitized startup logs show DB auth; use the CA at `server/certs/supabase-prod-ca.crt` via `SUPABASE_DB_CA_FILE` for local Supabase TLS.
5. Exercise an authenticated read-only flow before controlled writes.

Use a disposable DB for migrations/schema experiments. Do not assume service liveness proves payment, mail, socket or business workflow correctness.
