# AI matching and shortlisting

Node's protected `/api/v1/ai` controller calls Flask through the internal service URL. Flask validates the job/candidate payload and the candidate matcher scores it using configurable weights: skills 0.40, experience 0.30, education 0.15, industry 0.10, text 0.05 by default. Configuration checks that weights total 1 and applies a candidate limit and minimum similarity threshold.

## Implemented scoring details

Skills score combines case-insensitive direct requirement-string matches with TF-IDF vector cosine similarity (60/40 blend) and a bounded bonus for configured high-demand terms. Experience and full-profile text use TF-IDF/cosine similarity where vectorizers are available; experience has a keyword/Jaccard fallback. Education combines an education-level heuristic (30%) and field/requirement TF-IDF cosine similarity (70%). Industry score uses direct and configured related-industry string rules. Missing values receive neutral defaults in several component scorers, so a missing field is not always a zero. Candidate scores are sorted descending and capped by `MAX_CANDIDATES`; `MIN_SIMILARITY` is applied in the service configuration/controller path. This is lexical NLP plus business rules, not a trained predictive hiring classifier. Treat scores as recruiter decision support, never as an automatic hire/reject decision.

## User interaction

Recruiter requests a shortlist from a job context; the API loads eligible application/candidate data, proxies the bounded payload to Flask, and returns ordered scores/reasons. A preview endpoint supports inspection without the normal shortlist persistence path. The recruiter makes the advancement decision; persist that decision through the application workflow rather than treating a score as a final action.

## Edge cases and responsible use

- Empty candidate set, missing resume fields, unknown skill terms, sparse job requirements, malformed weights, no qualifying score, and model service timeout must be handled as distinct outcomes.
- Candidate count and payload size should be bounded to avoid large serverless work and database reads.
- Score weights and model artifacts need versioning/documentation when changed so results can be interpreted.
- Synthetic/training data and ranking metrics do not demonstrate fairness or real-world predictive validity. Review bias, explainability and privacy before consequential use.
- Do not present model ranking as an objective hiring decision; recruiter review remains required.

Implementation: `server/controllers/ai.controller.js`, `server/routes/ai.routes.js`, `ml-services/controllers/shortlist_controller.py`, `ml-services/models/candidate_matcher.py`, and `ml-services/config/settings.py`.
