# MetrcMatch Managed Environment Reference

This document is a **secret-free configuration reference**. Configure the actual values through the project secret manager; do not commit a `.env` or `.env.example` file containing live credentials.

| Variable                      | Required in production | Validation / default                   | Purpose                                                                                  |
| ----------------------------- | ---------------------: | -------------------------------------- | ---------------------------------------------------------------------------------------- |
| `DATABASE_URL`                |                    Yes | Must be present at server start.       | Managed MySQL/TiDB runtime connection.                                                   |
| `JWT_SECRET`                  |                    Yes | Must be present at server start.       | Signs session cookies.                                                                   |
| `VITE_APP_ID`                 |                    Yes | Must be present at server start.       | Manus OAuth application identifier.                                                      |
| `OAUTH_SERVER_URL`            |                    Yes | Must be present at server start.       | Manus OAuth server base URL.                                                             |
| `METRC_REQUEST_TIMEOUT_MS`    |                     No | Positive integer; defaults to `15000`. | Timeout for outbound Metrc HTTP requests.                                                |
| `RESEND_API_KEY`              |                     No | Empty disables email delivery.         | Resend API credential for alert email.                                                   |
| `RESEND_FROM_EMAIL`           |                     No | Empty disables email delivery.         | Verified sender for alert email.                                                         |
| `STRIPE_SECRET_KEY`           |           Billing only | Platform-managed secret.               | Creates Checkout and Customer Portal sessions and verifies billing state.                |
| `STRIPE_WEBHOOK_SECRET`       |           Billing only | Platform-managed secret.               | Verifies signed events at `/api/stripe/webhook`.                                         |
| `VITE_STRIPE_PUBLISHABLE_KEY` |                     No | Platform-managed public value.         | Reserved for client-side Stripe features; hosted Checkout currently does not require it. |

The server calls `assertProductionConfiguration()` before listening in production. This fails fast when a required runtime value is absent. Facility-specific Metrc keys are not environment variables: managers enter them through the protected settings screen, and the server encrypts them before persistence.

> Keep alert delivery disabled until both Resend values are configured and the sender domain is verified.

## Stripe subscription operations

Stripe billing is configured through the project’s managed integration; **do not commit, request, or paste secrets into source files**. In Stripe, configure the signed webhook destination as:

```text
https://<published-domain>/api/stripe/webhook
```

The endpoint must receive the subscription events `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_failed`. It is registered ahead of JSON parsing so Stripe signature verification operates on the original request body.

The current self-service plans are **Starter** at $149/month for one license and up to two users, and **Growth** at $349/month for up to three licenses with daily sync and alerts. Checkout creates a card-required 14-day trial and defers the first charge until the trial ends. The license and user figures are currently presented as plan capacity; multi-facility and cross-facility license enforcement is intentionally deferred until the product includes a facility-group model.
