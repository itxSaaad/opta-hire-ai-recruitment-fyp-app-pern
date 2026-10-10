# Model artifact storage

OptaHire's ML service runs on Vercel Functions, whose local filesystem is not a durable shared location. The service now uses a private Vercel Blob store named `optahire-ml-models` as the source of truth for trained artifacts. A writable `/tmp` directory is used only as a per-instance inference cache.

## Bundle and publication format

The service saves these files into one ZIP bundle:

- `text_vectorizer.pkl`
- `skills_vectorizer.pkl`
- `training_state.json` (including sample count, training time, model version, and scoring weights)

Each trained version is written under `models/<environment>/versions/` with a unique name. The service reads back the uploaded bundle and verifies its SHA-256 digest before updating `models/<environment>/current.json`. The manifest update is the final publication step, so a partial upload never becomes the active model. Old bundles are intentionally retained for rollback; delete unused versions from Vercel Blob after confirming they are no longer needed.

## Environment isolation

The same private store is connected to the Vercel project for Production, Preview, and Development. The artifact namespace is selected from `VERCEL_ENV` (`production`, `preview`, or `development`), so Preview training cannot overwrite Production's pointer. `MODEL_ARTIFACT_NAMESPACE` can override this in a controlled non-production environment. The default `MODEL_ARTIFACT_BACKEND=auto` enables Blob when Vercel Blob credentials are available and uses local storage for ordinary offline development.

Vercel injects the store credentials into each connected environment. Do not add `BLOB_READ_WRITE_TOKEN`, `BLOB_STORE_ID`, or OIDC values to source control or `VITE_*` variables. The root Vercel project owns the connection, so all three Vercel services receive the project-level storage variables.

## Startup and refresh behavior

On startup, the service downloads and validates that environment's active manifest and bundle, then loads the vectorizers into memory. If no manifest exists, it makes a one-time attempt to migrate the model bundled in `ml-services/data/models` into the correct environment namespace. A Blob access error does not silently fall back to a stale bundled model. Warm instances check the active manifest every 15 seconds and reload only when its bundle path changes.

Health and metrics distinguish durable Blob availability from the local cache path. A healthy writable cache alone does not count as durable storage. A failed Blob publish makes model training fail rather than reporting an unsaved model as trained.

## Local development

Connect the Blob store's Development environment to the Vercel project, then from the repository root link the project and pull its Development variables to the ML service's ignored `.env` file:

```powershell
vercel link --project opta-hire-ai-recruitment-fyp-app-pern
vercel env pull ml-services/.env --environment development
```

Run the ML service from `ml-services` so `python-dotenv` loads that file. Local development uses its own `development` namespace. If Blob credentials are unavailable, local-only mode can still train and cache a model on disk; that model is not shared with Vercel.

## Operational limits

The free Hobby allocation includes 1 GB of Blob storage, 10,000 simple operations, 2,000 advanced operations, and 10 GB of Blob data transfer per month. Model bundles are private and downloaded only by server instances. Monitor Vercel Blob usage before adding unrelated files or keeping many obsolete model versions.

Training remains synchronous in the current Flask API. If it exceeds the configured Vercel Function duration or memory limits, storage persistence will not fix that compute limit; move training to a durable job runner while keeping the same Blob bundle and manifest format.
