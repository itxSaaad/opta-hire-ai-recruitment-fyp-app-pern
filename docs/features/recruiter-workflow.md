# Recruiter workflow

Recruiter screens cover dashboard, jobs, applications, chats, interviews, contracts and ratings. The API domains are jobs, applications, AI, chat rooms, interviews, contracts and reports.

## Typical flow

1. Create or manage a job with validated role requirements.
2. Review applications and candidate profile/resume context.
3. Request AI ranking/shortlist preview; inspect the reasons and candidate information.
4. Choose which candidates to advance. AI is decision support, never an automatic hire.
5. Communicate with applicants, coordinate interviews, record workflow transitions and prepare contracts.
6. Review interview feedback and transaction state through authorized views.

## Edge cases and data discipline

Job ownership must be checked server-side. Handle empty candidate pools, closed jobs, duplicate state transitions, stale applicant lists, model unavailability, partial candidate data, and unauthorized cross-company access. Preview requests should not silently mutate applications. Batch and paginate applicant data; avoid loading every resume or message into one request. Recheck permissions on each API request, not just the recruiter page guard.

Source: `client/src/pages/recruiter/`, `server/routes/job.routes.js`, `application.routes.js`, `ai.routes.js`, and their controllers.
