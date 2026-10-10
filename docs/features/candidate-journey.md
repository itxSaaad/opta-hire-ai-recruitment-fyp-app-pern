# Candidate journey

The client exposes job discovery, candidate dashboard, applications, application submission, success, interviews, profile and resume screens. Relevant API domains are `/jobs`, `/applications`, `/resumes`, `/users`, `/interviews`, `/chat-rooms`, and `/contracts`.

## Typical journey

1. Register/login and complete any profile verification.
2. Maintain profile and resume information used in recruiting and matching.
3. Browse/filter job openings and inspect a specific opening.
4. Submit an application; receive a result and see the persisted application state.
5. Track application progress and communicate with the recruiter when the workflow permits.
6. Join scheduled interviews; review feedback/status and any related contract state.

## Reliability and edge cases

Handle missing/incomplete resume fields, closed or stale job postings, duplicate application attempts, expired sessions, validation errors, network timeout, and a state change made by a recruiter while the candidate page remains open. Refresh authoritative status after mutation instead of assuming optimistic UI is durable. Prevent repeated submission on a slow response and show a clear success/error outcome. Personal resume data must be scoped to its owner and only shared through an authorized workflow.

Screen code is in `client/src/pages/candidate/` and `client/src/pages/user/`; domain behavior is in the corresponding Express routes/controllers and Sequelize models.
