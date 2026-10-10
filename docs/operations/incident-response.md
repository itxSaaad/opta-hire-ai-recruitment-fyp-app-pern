# Incident response notes

## Express function crash

Inspect first stack frame and imports passed into `app.use`; `Router.use() requires a middleware function but got a Object` commonly means an invalid module export. Confirm `server/app.js` is the Node entrypoint and the exact `/api` rewrite exists.

## Database

Check env scope has DB URL and CA, pooler host/port, SSL and CA parsing. Log connection success/failure without connection strings, usernames or `process.env` dumps. Never disable certificate verification to mask a trust/config error.

## ML

Check Flask deployment and `/api/v1/health/ai-service`, then Node's `ML_SERVICES_URL` binding and proxy timeout/error mapping. Local Flask health does not prove hosted service binding.

## Realtime and external providers

For sockets inspect WebSocket transport, handshake auth, membership, reconnect/rejoin, and process-instance affinity. Separate signaling failures from peer ICE/media issues. For payment check key mode, signed webhook attempts and transaction reconciliation; redirect alone is not success. For mail check SMTP configuration, sender verification and quota.

Record deployment id/time/error class and rollback status. Preserve old services until the cutover is verified.
