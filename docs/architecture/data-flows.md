# End-to-end data flows

## Candidate application

```mermaid
sequenceDiagram
  actor Candidate
  participant Browser as "React client"
  participant Express as "Express API"
  participant Postgres as "Supabase PostgreSQL"
  Candidate->>Browser: Sign in, update profile/resume, choose job
  Browser->>Express: Cookie-authenticated /api/v1 calls
  Express->>Postgres: Read user/resume/job; write application
  Postgres-->>Express: Application state
  Express-->>Browser: Result and next step
  Browser-->>Candidate: Confirmation and application status
```

Exact required fields and transitions are in the application/resume controllers and Sequelize models. Consult [feature workflows](../features/README.md) and [data model](../data/models.md) before changing them.

## AI shortlist

```mermaid
sequenceDiagram
  actor Recruiter
  participant Browser as "React client"
  participant Express as "Express API and AI proxy"
  participant Flask as "Python Flask service"
  participant Postgres as "Supabase PostgreSQL"
  Recruiter->>Browser: Request shortlist for job
  Browser->>Express: Authenticated recruiter request
  Express->>Postgres: Load job and eligible candidates
  Express->>Flask: Private JSON request via service binding
  Flask->>Flask: Validate features and calculate weighted scores
  Flask-->>Express: Ranked candidates and score details
  Express-->>Browser: Preview or shortlist result
  Browser-->>Recruiter: Review recommendation
  Recruiter->>Browser: Accept workflow action
  Browser->>Express: Persist decision
  Express->>Postgres: Update application state
```

Preview returns rankings without the normal shortlist persistence path. Model output is decision support; the recruiter owns the hiring decision.

## Chat, interview, and payment

Chat writes go through Express/PostgreSQL and socket events deliver live updates. The video namespace announces participants and carries WebRTC signaling; media itself is peer-to-peer. Payment goes from browser Stripe Elements to API and Stripe. Asynchronous events come back through the raw-body signature-verified webhook before transaction state changes.

## Failure/retry boundaries

The shared client request uses a 10-second timeout. A failed request should remain retryable where safe. Avoid duplicating non-idempotent application/payment writes. Socket reconnect/rejoin may lose transient presence. ML failure must not become an empty ranking. Database errors should not log connection strings or PII.
