# External service calls and webhooks

## Stripe

Webhook path: `/api/v1/payments/webhooks/stripe`. `server/app.js` preserves raw bytes in the JSON parser's `verify` hook for this exact route. The payment controller validates the Stripe signature with `STRIPE_WEBHOOK_SECRET`. Do not reorder middleware so raw bytes disappear, log webhook contents, or trust a claimed Stripe event without signature validation.

Stripe retries deliveries. Handle duplicates idempotently by checking event/transaction state before repeating effects. The browser redirect is not payment confirmation; reconcile from verified Stripe events and transaction state.

## ML proxy

The Node AI controller invokes Flask through `ML_SERVICES_URL`; Vercel supplies the internal service binding and local development uses `http://localhost:5001/`. Keep the ML origin private where possible. Bound payload/time, and surface downstream failures as errors rather than empty successful rankings.

## SMTP

Nodemailer uses `NODEMAILER_SMTP_*` for verification, reset, and product notices. Delivery depends on provider sender verification/quota. A mail failure should not corrupt the primary business state; expose a retryable outcome where the feature supports it. Never log credentials or full personal data.
