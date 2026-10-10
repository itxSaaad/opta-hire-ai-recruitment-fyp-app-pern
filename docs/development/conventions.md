# Code conventions and practices

## Boundaries

- Components call feature API modules; Express controllers own server behavior; Sequelize owns persistence mapping; Flask owns scoring.
- Validate and authorize writes in the API even if client routes are guarded.
- Keep ML behind the API proxy; translate downstream failures without exposing internal URLs or stack traces.
- Keep credentials server-side; verify payment callbacks from signed raw-body webhooks.

## Reliability/performance

- Paginate large job, applicant, message, report and admin lists; select needed columns and avoid per-row DB queries.
- Bound text, upload size, request body, candidate count and ML work to protect DB/function budgets.
- Avoid duplicate effects from React rerenders, reconnects or retry. Payment and webhook transitions should be idempotent.
- Represent loading, empty, auth, validation, network, downstream timeout and stale-session states explicitly.
- Do not treat process memory as durable: cold starts reset counters, room maps and model status.

## Change discipline

Update code and docs together for routes, roles, env names, Vercel rewrites, schema, scoring weights, payment and socket event changes. Use additive migrations before deploying code dependent on new fields; do not rely on production `sync()`. Keep logs sanitized and commits behavior-focused.
