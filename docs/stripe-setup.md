# Stripe Setup Guide (New Developer Account)

This guide explains exactly how a new developer should set up Stripe for this project and where each key or secret goes.

## 1) Create and prepare a Stripe account

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/).
1. Create a new account (or log in) and switch to **Test mode**.
1. Complete business profile prompts if Stripe requires them.

Notes:

- Start with test mode keys first.
- Use live mode only after end-to-end testing.
- Keep each environment (local, staging, production) on separate webhook endpoints and secrets.

## 2) Get API keys from the Dashboard

1. In Stripe Dashboard, open **Developers -> API keys**.
1. Copy these keys:

- **Publishable key** (`pk_test_...`)
- **Secret key** (`sk_test_...`)

Where to use them in this project:

- Server `.env`:
  - `STRIPE_SECRET_KEY=sk_test_...`
- Client `.env`:
  - `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`

Do not place secret keys in client-side environment variables.

## 3) Create the webhook endpoint in Stripe Dashboard

1. In Stripe Dashboard, open **Developers -> Webhooks**.
1. Click **Add endpoint**.
1. Set endpoint URL to your server payment webhook route:

```text
<SERVER_BASE_URL>/api/v1/payments/webhooks/stripe
```

Example local URL:

```text
http://localhost:5000/api/v1/payments/webhooks/stripe
```

1. Select these events (minimum required by current backend logic):

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `account.updated`

1. Save endpoint, then open it and reveal or copy the **Signing secret** (`whsec_...`).

Where to use it:

- Server `.env`:
  - `STRIPE_WEBHOOK_SECRET=whsec_...`

## 4) Configure project environment variables

Server `.env` required Stripe values:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Client `.env` required Stripe values:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Also ensure server or client URL variables are correct for onboarding redirects:

```env
# server .env
CLIENT_URL=http://localhost:5173
```

The backend uses `CLIENT_URL` for Stripe Connect onboarding return and refresh URLs.

## 5) Stripe Connect setup expectations (for interviewer payouts)

This backend creates **Express Connect accounts** for interviewers.

From dashboard perspective:

- Make sure Connect is enabled in your Stripe account.
- Test with onboarding flow initiated by the app endpoint:
  - `POST /api/v1/payments/connect/onboard`

The app then redirects interviewer users to Stripe onboarding and tracks account status via:

- `GET /api/v1/payments/connect/status`

## 6) Local webhook testing options

Option A: Public or staging deployment

- Use deployed backend URL directly in Stripe webhook endpoint.

Option B: Local development

- Expose local server publicly (for example with Stripe CLI forward or tunneling).
- Set webhook endpoint URL to the forwarded URL ending with:
  - `/api/v1/payments/webhooks/stripe`

After forwarding, copy the provided signing secret and set `STRIPE_WEBHOOK_SECRET`.

## 7) Verify setup end-to-end

1. Start server and client.
1. Confirm client loads Stripe using publishable key.
1. Create a test payment (or contract payment flow).
1. In Stripe Dashboard -> Webhooks, confirm webhook deliveries are successful (HTTP 2xx).
1. Confirm backend updates expected entities:

- Payment success and failure transaction status.
- Stripe Connect account status updates on `account.updated`.

## 8) Security and team onboarding rules

- Never commit `.env` files with real Stripe keys.
- Rotate keys immediately if exposed.
- Give each developer their own test keys where possible.
- Use separate Stripe accounts or projects for staging vs production.

## 9) Common troubleshooting

- **Webhook signature verification fails**:
  - Ensure endpoint URL path is exactly `/api/v1/payments/webhooks/stripe`.
  - Ensure `STRIPE_WEBHOOK_SECRET` matches the specific endpoint in Dashboard.
  - Ensure Stripe sends events from the same mode (test or live) as your keys.
- **Payments fail to initialize**:
  - Check `STRIPE_SECRET_KEY` is set on server and starts with `sk_test_` in test mode.
- **Stripe UI not loading in client**:
  - Check `VITE_STRIPE_PUBLISHABLE_KEY` is set and starts with `pk_test_`.

---

If you need production rollout, repeat the same steps in **Live mode**, replace test keys or secrets with live ones, and create a separate live webhook endpoint.
