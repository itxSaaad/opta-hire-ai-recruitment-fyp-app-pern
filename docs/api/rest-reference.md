# REST and ML route reference

Express business routers are mounted under `/api/v1` in `server/app.js`. This table documents router families. Exact methods, payloads and role checks live in `server/routes/*.routes.js` and controllers.

| Prefix | Domain | Access considerations |
| --- | --- | --- |
| `/auth` | Register, login/session, verification, password reset | Public/authenticated steps vary |
| `/users` | Profiles and account administration | Record owner/admin |
| `/resumes` | Candidate resume data | Candidate owner |
| `/jobs` | Job search and opening management | Recruiter/admin for writes |
| `/applications` | Apply, inspect applicants, progress states | Candidate/recruiter ownership |
| `/chat-rooms` | Room membership and message history | Room participant |
| `/contracts` | Hiring agreement workflows | Parties/privileged role |
| `/transactions` | Financial records | Owner/admin by operation |
| `/interviews` | Schedule/manage interview | Authorized participants |
| `/interviewer-ratings` | Interview feedback | Assigned participant/admin |
| `/payments` | Payment, Connect, Stripe webhook | Authenticated or signature verified |
| `/ai` | Health, model operations, shortlisting | Recruiter/admin restrictions |
| `/reports` | Usage, job, finance, interview, funnel reports | Admin/authorized role |

## Health and discovery

- `GET /api` returns API identity and route links. The exact Vercel `/api` rewrite is required.
- `GET /api/v1/test` is API liveness only; it does not prove DB/ML readiness.
- `GET /api/v1/ai/health/system` is protected Express/ML system health.
- `GET /api/cron/scheduled-payouts` is an internal cron trigger. It requires a bearer `CRON_SECRET` and honors `DISABLE_SCHEDULED_PAYOUTS`; see the [scheduled payout runbook](../operations/scheduled-payouts.md).
- `GET /api-docs` exposes Swagger only in development.

## Flask endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | Service identity and endpoint discovery |
| GET | `/api/v1/health/` | ML process health |
| GET | `/api/v1/health/ai-service` | Model/service readiness |
| POST | `/api/v1/shortlist/candidates` | Candidate ranking/shortlist operation |
| POST | `/api/v1/shortlist/preview` | Ranking without normal shortlist persistence path |
| POST | `/api/v1/model/train` | Training operation (runtime constrained) |
| GET | `/api/v1/model/status` | Model/training state |
| GET | `/api/v1/model/metrics` | Model metrics |

Browser requests should use the Express proxy; do not expose Flask host URLs in public client config.
