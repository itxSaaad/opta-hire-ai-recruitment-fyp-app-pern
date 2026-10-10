# Decision 001: three services in one Vercel project

**Status:** Adopted for the current FYP deployment.  
**Context:** The platform contains browser, Express/Socket.IO and Python/Flask services. Earlier deployments split these across provider projects and Heroku; the target is affordable consolidation.

**Decision:** Deploy `client`, `server`, and `ml-services` as separate services in one Vercel project. Route public web paths to the client, `/api` and `/socket.io` to Node, and have Node call Flask through `ML_SERVICES_URL`. Use Supabase PostgreSQL, existing Stripe/SMTP integrations, and no Redis.

**Consequences:** Same-origin calls simplify domain/CORS config; API-to-ML stays server-side; each service keeps its native runtime. Serverless limits affect sockets, in-memory limits, model state and file writes. Preview and production currently share the DB and third-party effects, so Preview has real side effects. Keep old hosts available until data migration and hosted validation pass.

**Revisit if:** Vercel cannot sustain interview sockets, ML work exceeds runtime limits, Supabase quotas are insufficient, or Preview isolation becomes necessary.
