# Contracts, payments, and interviewer Connect

Contracts represent the hiring/engagement workflow; transactions represent payment state. Stripe Elements handles browser payment entry, the Node API uses server-only Stripe keys, and Stripe Connect supports interviewer payout onboarding with return/refresh pages.

## Safety boundaries

- Never treat client redirect/query parameters as payment success. Read verified transaction state.
- Verify webhook signature using raw bytes and handle duplicate delivery idempotently.
- Keep account/mode consistent between publishable and secret keys. Preview shares the current integration settings, so test actions can reach a real account.
- Connect onboarding return does not itself prove account readiness; refresh authoritative status.
- Scheduled payouts can be disabled via `DISABLE_SCHEDULED_PAYOUTS=true`; verify this stays intentional in local and hosted config.
- Handle canceled checkout, declined card, delayed webhook, webhook retry, incomplete onboarding, and duplicate user action without duplicating a charge or contract.

Implementation: `server/controllers/payment.controller.js`, payment routes/middleware, transaction and contract models, and the interviewer Stripe Connect screens. See [webhooks](../api/webhooks.md) and [environment policy](../operations/environment-variables.md).
