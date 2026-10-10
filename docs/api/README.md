# HTTP, webhook, and realtime API

The browser calls same-origin `/api/v1` through `client/src/api/axiosInstance.js`. Vercel sends `/api` descendants to Express. Express owns authentication/authorization; Flask is reached from Express for ML operations.

- [REST and Flask route reference](rest-reference.md)
- [Socket.IO and WebRTC contract](realtime.md)
- [Stripe, SMTP and ML calls](webhooks.md)

Swagger UI is enabled only in development. For exact payload schemas consult the route/controller validators and source annotations; update this index when paths or role requirements change.
