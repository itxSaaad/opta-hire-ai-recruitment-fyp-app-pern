# Service boundaries

| Boundary | Owns | Calls | Does not own |
| --- | --- | --- | --- |
| Browser client | Navigation, presentation, forms, client state, socket client, Stripe Elements | Same-origin API, Socket.IO, Stripe.js, WebRTC peer | Authorization decisions, credentials, durable state, scoring internals |
| Node API | Authentication, role enforcement, validation/orchestration, durable workflows, integrations, signaling | Sequelize/PostgreSQL, private Flask endpoint, SMTP, Stripe | Browser rendering, model training, peer media transport |
| Flask ML | Health, candidate scoring/shortlist response, model metrics/training endpoint | Bundled Python artifacts and config | User sessions, payment, authoritative workflow writes |
| Supabase PostgreSQL | Durable identity, jobs, applications, interviews, messages, contracts, transactions and ratings | Node over TLS | Socket presence, rate counters, process training status |
| Stripe | Payment and Connect operations | Browser SDK, API, signed webhook | OptaHire workflow state (mirrored in application records) |

The route tree is mounted in `server/app.js`; per-route access is in route middleware. The browser should not call Flask directly. Keep service communication behind these seams so authentication, error translation and observability remain consistent.

## Trust and failure boundaries

- Treat browser input as untrusted; validate shape and ownership before a model call or database mutation.
- Role checks are server-side. A UI guard only improves navigation.
- Model scores are recommendations; they do not authorize a hiring action.
- Accept Stripe callbacks only after signature verification over raw bytes.
- Use the Supabase CA when configured; do not disable TLS certificate checks to mask connection problems.
- An ML, mail or socket failure should surface as a meaningful failure/degraded state, not fabricated success.
