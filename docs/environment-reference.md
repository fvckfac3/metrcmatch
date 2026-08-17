# MetrcMatch Managed Environment Reference

This document is a **secret-free configuration reference**. Configure the actual values through the project secret manager; do not commit a `.env` or `.env.example` file containing live credentials.

| Variable                   | Required in production | Validation / default                   | Purpose                                   |
| -------------------------- | ---------------------: | -------------------------------------- | ----------------------------------------- |
| `DATABASE_URL`             |                    Yes | Must be present at server start.       | Managed MySQL/TiDB runtime connection.    |
| `JWT_SECRET`               |                    Yes | Must be present at server start.       | Signs session cookies.                    |
| `VITE_APP_ID`              |                    Yes | Must be present at server start.       | Manus OAuth application identifier.       |
| `OAUTH_SERVER_URL`         |                    Yes | Must be present at server start.       | Manus OAuth server base URL.              |
| `METRC_REQUEST_TIMEOUT_MS` |                     No | Positive integer; defaults to `15000`. | Timeout for outbound Metrc HTTP requests. |
| `RESEND_API_KEY`           |                     No | Empty disables email delivery.         | Resend API credential for alert email.    |
| `RESEND_FROM_EMAIL`        |                     No | Empty disables email delivery.         | Verified sender for alert email.          |

The server calls `assertProductionConfiguration()` before listening in production. This fails fast when a required runtime value is absent. Facility-specific Metrc keys are not environment variables: managers enter them through the protected settings screen, and the server encrypts them before persistence.

> Keep alert delivery disabled until both Resend values are configured and the sender domain is verified.
