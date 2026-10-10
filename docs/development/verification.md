# Verification checklist

No one green health route proves product readiness.

## Local

1. Install from lockfiles and start all three processes at intended runtimes.
2. Check client, Node and Flask health endpoints.
3. Confirm API logs show DB auth/TLS without printing secrets.
4. Build client and run configured lint; resolve warnings affecting routes or accessibility.
5. Exercise controlled account flows: login/logout, profile/resume, job/apply, recruiter review/shortlist preview, interview/chat, admin read-only reports.
6. Validate Stripe test webhook signatures and SMTP only with controlled recipients.

## Hosted

Verify exact Vercel project, branch, domains, service bindings and env scopes; inspect build/runtime logs; test `/`, exact `/api`, `/api/v1/test`, Flask health through Express, browser routes, DB-backed read and socket handshake. For migration, reconcile counts and representative reads before writes. Preserve rollback through observation.

`/api/v1/test` does not prove DB, migrations, SMTP, Stripe, ML, roles, socket continuity or workflow. Flask health does not prove Node service binding; a client build does not prove routes and API interactions.
