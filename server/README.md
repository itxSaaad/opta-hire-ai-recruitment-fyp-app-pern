# OptaHire API

Express and Socket.IO API for authentication, recruitment workflows, persistence, notifications, payments, and the protected ML proxy.

- [API server guide](../docs/services/api.md)
- [Route and realtime reference](../docs/api/README.md)
- [Data model](../docs/data/README.md)
- [Local development](../docs/development/local-setup.md)
- [Environment variables](../docs/development/configuration.md)
- [Deployment and database migration](../docs/operations/README.md)

Start locally with `npm install` then `npm run dev`. Start Flask separately; set `ML_SERVICES_URL=http://localhost:5001/` in the API environment. Keep credentials in private local settings and never commit them.
