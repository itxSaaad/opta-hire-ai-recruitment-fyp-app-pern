# Hobby-tier operating envelope

Current choices favor low fixed cost: one Vercel multi-service project, Supabase Free PostgreSQL, and no OptaHire Redis/Upstash. Provider quotas and free-tier terms change, so verify live limits before increasing usage.

## Current constraints

- Express/Flask rate limits use process memory. Counters reset on cold start/restart and are not shared across instances; these are not globally consistent quotas.
- Socket.IO room and participant maps are process-local. Deploy/restart clears presence; participants routed to different instances may not share state. This is a demo-scale tradeoff; horizontal scale needs an adapter or managed realtime service.
- Serverless WebSocket lifetimes and function limits may conflict with long interviews. Verify the actual hosted handshake/session behavior; use a low-cost always-on API host only if the measured platform limit requires it.
- Supabase Free storage/compute and inactivity behavior constrain a shared Preview/Production DB. Monitor quotas and keep verified backups.
- Flask model training state and filesystem writes are ephemeral. Treat committed artifacts as deployment inputs; do not rely on serverless training state surviving a cold start.
- Bound uploads, request bodies, candidate batches, SQL query count, report ranges and logs. Prefer pagination and narrow projections as data grows.

## Revisit when

Reassess when sockets need cross-instance rooms, DB connections exhaust, cold starts/function duration break a flow, storage nears quota, scoring exceeds runtime budgets, or abuse requires global rate limiting. Measure first and add a paid dependency only to solve a demonstrated limit.
