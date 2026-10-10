# Heroku PostgreSQL to Supabase migration

This procedure protects source data and provides rollback. The Heroku app was observed active during this work; Vercel now has the shared Supabase connection in Production and `develop` Preview. A final synchronized migration and hosted validation are still needed before retiring old services.

## Preflight

1. Confirm Supabase project, destination, TLS CA and exact Vercel env scope; confirm Heroku app/database attachment by exact identity.
2. Inventory schema/migrations, extensions, sequences, constraints, indexes, large objects and row counts on both databases. Sample records without logging PII.
3. Capture and verify a fresh Heroku backup; take a Supabase snapshot/`pg_dump` as rollback before replacing destination data. Store artifacts in ignored `.opta-migration/` only.
4. Check PostgreSQL version, extensions and owner/role compatibility. A restore using clean/drop can destroy target data; test against a disposable DB when possible.

## Cutover

1. Arrange a write pause/consistent snapshot; stop background writers and confirm the source is quiescent.
2. Capture/download final source backup and record snapshot time/row counts.
3. Restore using an explicit schema/data plan. Resolve provider-owned role statements; preserve sequence positions, indexes, constraints and extensions.
4. Compare table counts, FK/orphan checks, sequences, sampled values, timestamps/time zones, and file references.
5. Deploy Vercel and verify login, profile/resume, jobs/applications, AI preview, interview/chat, contract/payment/webhook, mail and admin reports using controlled accounts.
6. Monitor logs and DB state while rollback remains available. Record operator decision before disabling old services.

## Rollback

Route traffic back to the old service if validation fails. Restore the Supabase pre-cutover snapshot only if destination writes require it. If both systems accepted writes, reconcile deltas deliberately; never overwrite one blindly. Keep Heroku/Render until user acceptance and data verification.

## Credential handling

The same current DB credential is shared with Preview at the user's direction and planned for later rotation. Update both Vercel scopes and local ignored bundles together, redeploy, and verify after rotation. Never commit credentials or dumps. The CA certificate is public trust material, not the DB password.
