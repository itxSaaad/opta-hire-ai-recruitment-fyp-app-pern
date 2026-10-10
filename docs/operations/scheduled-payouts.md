# Scheduled payout job

OptaHire has one payout job implementation with two trigger paths. Both call `processScheduledPayouts()` in the API. The job finalizes due payout transaction records and sends notifications. Stripe Connect routes the interviewer share to the connected account as part of the payment intent flow; this job does not create a second Stripe transfer.

## Vercel

The root `vercel.json` registers `GET /api/cron/scheduled-payouts` for 05:00 UTC daily. Vercel sends the request to the Express API service. The route requires `Authorization: Bearer $CRON_SECRET`; it returns 401 when the token is missing or incorrect. Set the same `CRON_SECRET` key in the project's generic Production and Preview environments. Preview deployments do not receive Vercel Cron invocations, but the authenticated route can be manually checked there.

Vercel Cron is registered from project configuration on production deployments. The schedule must remain daily for the Hobby plan; Hobby can invoke a job at any time during the configured UTC hour. Change the cron expression in `vercel.json` and redeploy when changing the production schedule.

## Local and EC2

The API also has an opt-in `node-cron` scheduler for persistent hosts. Set `ENABLE_LOCAL_SCHEDULED_PAYOUTS=true`, `DISABLE_SCHEDULED_PAYOUTS=false`, and optionally `SCHEDULED_PAYOUTS_CRON` and `SCHEDULED_PAYOUTS_TIMEZONE`. The defaults are `0 5 * * *` and `UTC`. Keep exactly one scheduler-enabled API instance per deployment; Vercel uses its HTTP Cron trigger and never starts a process-local timer.

Both trigger paths honor `DISABLE_SCHEDULED_PAYOUTS=true`. Production and Preview should keep that flag enabled until payment and email behavior has been reviewed against the live Stripe configuration. While disabled, the protected endpoint returns a successful skipped result and the background scheduler does not start. This preserves the schedule and trigger integration without processing payout records.

The database transition is conditional on the record still being pending, so repeated or overlapping requests cannot finalize the same record twice. The HTTP endpoint returns aggregate processed/failed counts and does not return customer or transaction details.
