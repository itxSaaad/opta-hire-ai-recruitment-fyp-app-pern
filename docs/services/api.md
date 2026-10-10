# Node API service

`server/app.js` exports the Express application and creates the shared HTTP server used by Socket.IO. Routes/controllers cover authentication, users, resumes, jobs, applications, chat, contracts, transactions, interviews, ratings, payments, AI and reports. Middleware handles auth, validation and errors; Sequelize models and migrations persist state.

The pipeline configures headers/CORS/cookies/logging, JSON parsing with Stripe raw-body capture, in-memory limiting and routers. `/api` is discovery; `/api/v1/test` is liveness. DB config supports `DATABASE_URL` and Vercel Postgres aliases plus Supabase CA TLS. Integrations: private Flask binding, Stripe, SMTP, PostgreSQL. No Redis adapter is used.

See [route map](../api/rest-reference.md), [webhooks](../api/webhooks.md), [data model](../data/models.md), and [operations](../operations/deployment.md).
