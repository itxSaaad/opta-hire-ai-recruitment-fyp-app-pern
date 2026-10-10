# Identity, roles, and profile

The auth screens under `client/src/pages/auth/` cover registration, login, profile verification and password reset. `server/routes/auth.routes.js`, auth controllers and middleware define the actual session/token lifecycle. The user screen supports profile maintenance; candidate resume flows are separate.

## Role surfaces

| Role | Main client areas | Intended responsibilities |
| --- | --- | --- |
| Candidate | `pages/candidate/`, `pages/user/` | Maintain profile/resume, browse jobs, apply, track applications, attend interviews |
| Recruiter | `pages/recruiter/` | Manage openings, review applicants, request ranking, chat, contracts and interviews |
| Interviewer | `pages/interviewer/`, `pages/interview/` | Review assigned interviews, communicate, attend and rate interviews, connect payouts |
| Admin | `pages/admin/` | Manage users/jobs/workflows and access report/financial/AI configuration views |

## Edge cases to preserve

- Expired/invalid session should return to a safe auth flow; protected API requests still need server middleware.
- A user attempting to access another person's record must fail ownership checks even if they alter a URL or API payload.
- Verification and password reset links are time-sensitive and must not leak whether an arbitrary address has an account.
- Role changes should take effect in API authorization, not only after client navigation refresh.
- Profile and resume completion are distinct concerns; changing one should not erase the other accidentally.

Review `server/middlewares/`, auth/user routes and controllers before changing claims, cookie options or role transitions. Never store signing secrets in browser env values.
