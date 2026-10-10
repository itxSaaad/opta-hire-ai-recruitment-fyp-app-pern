# Administration and reporting

Admin screens cover dashboards and management of users, jobs, applications, contracts, interviews, ratings, transactions, AI configuration, and reports. Reports include user activity, job performance, finance, interview and funnel views. The API's `reports` and domain routers/controllers enforce privileged access.

## Operational edge cases

Admin actions affect multiple users and may be hard to reverse. Confirm target identity and state before destructive changes; preserve audit context where implemented. Paginate large tables, constrain report time ranges, handle empty datasets, and avoid leaking candidate PII in aggregate exports. Financial screens should reflect verified transaction records, not browser payment callbacks. AI configuration changes should validate the complete scoring-weight sum and preserve known-good defaults.

Implementation references: `client/src/pages/admin/`, `server/routes/report.routes.js`, domain routes, report controllers, and `ml-services/config/settings.py`.
