# OptaHire documentation

These guides describe behavior implemented in the repository and current hosting configuration. Provider dashboards can change independently; verify live state before an operational change.

## Start here

- [Architecture](architecture/README.md): services, boundaries, user interactions, request paths, performance limits, and design decisions.
- [Features](features/README.md): candidate, recruiter, interviewer, admin, matching, realtime, and payment workflows.
- [API](api/README.md): REST mount reference, Flask endpoints, realtime contracts, and external integrations.
- [Data](data/README.md): Sequelize entities, associations, schema evolution, and migration runbook.
- [Development](development/README.md): local setup, configuration, conventions, and verification.
- [Operations](operations/README.md): deployment, environment scopes, migration/rollback, incidents, and retirement criteria.
- [Services](services/): implementation maps for the client, API, and ML service.
- [Security](security/README.md): auth, trust boundaries, secrets, integrations, and availability.

## Reading paths

| Reader | Suggested guides |
| --- | --- |
| Contributor | [Development](development/README.md) → [Architecture](architecture/README.md) → [Features](features/README.md) → [API](api/README.md) |
| Frontend developer | [Client](services/client.md) → [Features](features/README.md) → [REST and realtime](api/README.md) |
| Backend developer | [API service](services/api.md) → [Data model](data/models.md) → [Security](security/README.md) |
| Operator | [Deployment](operations/deployment.md) → [Environments](operations/environment-variables.md) → [Migration](data/migration-runbook.md) |

Real credentials belong in local secret storage and provider settings. Never commit private configuration, dumps, tokens, private keys, or provider output containing secret values. Browser `VITE_*` variables are public by design; server credentials must never use that prefix.
