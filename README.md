# MetrcMatch

> **Private repository.** MetrcMatch is a compliance-oriented inventory reconciliation workspace for Oregon cannabis operators. It helps facility teams reconcile Metrc records with documented physical reality, investigate variances, and prepare audit-ready reconciliation evidence.

MetrcMatch is designed to support operational reconciliation work. It **does not replace a facility’s independent obligation** to validate records, retain required documentation, or complete regulatory reporting.

## Contents

- [Product capabilities](#product-capabilities)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Prerequisites and local setup](#prerequisites-and-local-setup)
- [Configuration](#configuration)
- [Database and migrations](#database-and-migrations)
- [Billing and access control](#billing-and-access-control)
- [API surface](#api-surface)
- [Operations](#operations)
- [Quality checks](#quality-checks)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Security and support](#security-and-support)
- [License](#license)

## Product capabilities

| Area                      | Current capability                                                                                                                              |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Metrc integration**     | Stores encrypted facility-scoped Metrc credentials, validates connections, and synchronizes inventory, sales, and lab-test records.             |
| **Physical logging**      | Supports responsive physical count, damage/discard, and lab-test result forms with synced-product search, validation, and system timestamps.    |
| **Reconciliation**        | Compares the latest Metrc quantity and physical count, flags variances above **5 units or 5%**, and assigns medium, high, or critical severity. |
| **Investigation**         | Captures suggested causes, resolution status, notes, and a discrepancy timeline.                                                                |
| **Reporting**             | Generates facility-scoped reconciliation reports for a selected date range in PDF or CSV format, including preparer metadata.                   |
| **Operational dashboard** | Displays sync status, facility inventory metrics, discrepancy severity, audit-risk context, and persisted reconciliation trends.                |
| **Notifications**         | Records critical/high discrepancy and audit-risk events; email delivery remains suppressed until Resend configuration is present.               |
| **Billing**               | Uses Stripe Checkout for card-required 14-day trials, self-service subscription management, and plan-aware access enforcement.                  |

The public website intentionally avoids two unsupported claims: **POS connectivity is planned rather than live**, and customer-proof content remains a labeled placeholder until approved evidence is available.

## Architecture

| Layer                 | Implementation                                              | Responsibility                                                                                                                                |
| --------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Client                | React 19, Tailwind CSS 4, shadcn/ui, Wouter, TanStack Query | Responsive public marketing pages, pricing, billing, and the authenticated facility workspace.                                                |
| Application server    | Express 4, tRPC 11, Zod                                     | HTTP API routes, typed procedures, schema validation, OAuth/session handling, error mapping, and entitlement checks.                          |
| Data                  | Drizzle ORM with MySQL/TiDB-compatible runtime              | Facility-scoped operational records, membership, billing status, inventory snapshots, logs, discrepancies, reports, syncs, and notifications. |
| Payments              | Stripe SDK and hosted Stripe Checkout                       | Subscription customer creation, 14-day trials, webhook-driven subscription state, and customer portal sessions.                               |
| External integrations | Oregon Metrc API and optional Resend                        | Metrc inventory/sales/testing sync and optional alert-email delivery.                                                                         |

> The repository includes a portable PostgreSQL reference at [`docs/postgresql-schema.sql`](docs/postgresql-schema.sql). The deployed application uses the provisioned MySQL/TiDB-compatible Drizzle schema in [`drizzle/schema.ts`](drizzle/schema.ts).

## Repository layout

```text
client/
  src/pages/              # Landing, workspace, pricing, billing, and feature pages
  src/components/         # Shared dashboard shell and shadcn/ui components
server/
  _core/                  # Express, tRPC, OAuth, environment, and runtime integration
  routers/                # Facility-scoped tRPC feature routers
  routes/                 # REST auth, Metrc, logging, discrepancy, status, and billing routes
  billing.ts              # Stripe plans and entitlement helpers
  db.ts                   # Drizzle query helpers and facility persistence
drizzle/
  schema.ts               # Runtime database schema
  migrations/             # Generated, reviewed migrations
docs/                     # API, environment, integration, and verification documentation
scripts/
  verify-landing-keyboard.mjs  # Repeatable Chromium keyboard-order verification
```

## Prerequisites and local setup

Use **Node.js 22 or later** and **pnpm 10 or later**. The managed environment supplies OAuth, database, and platform configuration automatically. For local work, use development-safe secrets only and never commit a `.env` file with real credentials.

```bash
pnpm install
pnpm dev
```

The development server starts from [`server/_core/index.ts`](server/_core/index.ts). The project uses `pnpm-workspace.yaml` for pnpm overrides and patches; keep supported pnpm configuration there rather than in the legacy `pnpm` field of `package.json`.

## Configuration

Project secrets are managed through the hosting environment. The following table is a **secret-free reference**; see [`docs/environment-reference.md`](docs/environment-reference.md) for the complete operational description.

| Variable                      | Required | Purpose                                                                                               |
| ----------------------------- | -------: | ----------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                |      Yes | MySQL/TiDB-compatible database connection.                                                            |
| `JWT_SECRET`                  |      Yes | Signs HTTP-only session cookies.                                                                      |
| `VITE_APP_ID`                 |      Yes | Manus OAuth application identifier.                                                                   |
| `OAUTH_SERVER_URL`            |      Yes | OAuth service base URL.                                                                               |
| `STRIPE_SECRET_KEY`           |  Billing | Managed server-side Stripe credential for Checkout, billing status, and portal sessions.              |
| `STRIPE_WEBHOOK_SECRET`       |  Billing | Validates Stripe webhook signatures.                                                                  |
| `VITE_STRIPE_PUBLISHABLE_KEY` |       No | Reserved managed public Stripe value; hosted Checkout currently does not require direct client usage. |
| `METRC_REQUEST_TIMEOUT_MS`    |       No | Positive Metrc request timeout; defaults to `15000` milliseconds.                                     |
| `RESEND_API_KEY`              | Optional | Enables alert email delivery once a verified sender is configured.                                    |
| `RESEND_FROM_EMAIL`           | Optional | Verified sender address for alert email delivery.                                                     |

Facility-specific Metrc API credentials are entered through the authenticated settings experience, encrypted before persistence, and never returned to the client.

## Database and migrations

The production database is MySQL/TiDB-compatible. Make schema changes deliberately:

1. Update [`drizzle/schema.ts`](drizzle/schema.ts).
2. Generate a migration with `pnpm drizzle-kit generate`.
3. Review the generated SQL for data loss, locking, and compatibility risks.
4. Apply the reviewed migration through the managed database migration workflow.
5. Add or update database helper and endpoint tests.

Do not run destructive schema commands against production without a reviewed backup and migration plan. Database fields supporting Stripe billing include the facility Stripe customer ID, subscription ID, plan, status, trial end, and billing-period end.

## Billing and access control

MetrcMatch currently offers the following subscription configuration:

| Plan       |      Price | Included scope                                                       |
| ---------- | ---------: | -------------------------------------------------------------------- |
| Starter    | $149/month | One license and up to two users.                                     |
| Growth     | $349/month | Up to three licenses, daily sync, and alerts.                        |
| Enterprise |     Custom | Multi-license/MSO scope, dedicated support, and API-access planning. |

Stripe Checkout requires a card to begin a **14-day trial**. The first charge is deferred until the trial ends. Stripe webhooks update the facility entitlement cache for checkout completion, subscription updates/deletions, and payment failure.

Operational workspace routes, tRPC procedures, REST sync/log/status/discrepancy/report endpoints, report exports, and scheduled syncs require an active subscription or active trial. Signed-in facilities that are not entitled are sent to `/pricing`; `/billing` remains available so they can review status, select a plan, or enter the Stripe customer portal.

Configure the production Stripe webhook destination as:

```text
https://<published-domain>/api/stripe/webhook
```

Subscribe this destination to `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_failed`. The webhook route is registered before JSON parsing so Stripe receives the unmodified request body for signature verification.

## API surface

Browser workflows primarily use typed tRPC procedures. REST routes remain available for interoperability, authentication compatibility, and file downloads. The complete request/response contract is in [`docs/api-contract.md`](docs/api-contract.md).

| Route                     | Method | Access            | Purpose                                                                 |
| ------------------------- | ------ | ----------------- | ----------------------------------------------------------------------- |
| `/api/auth/signup`        | `POST` | Public            | Creates a password-auth account and issues an HTTP-only session.        |
| `/api/auth/login`         | `POST` | Public            | Authenticates a password-auth account and issues an HTTP-only session.  |
| `/api/billing/status`     | `GET`  | Signed in         | Returns facility plan, subscription, trial, and entitlement state.      |
| `/api/billing/checkout`   | `POST` | Signed in         | Creates a Stripe Checkout session for Starter or Growth.                |
| `/api/billing/portal`     | `POST` | Signed in         | Creates a Stripe Customer Portal session when a billing account exists. |
| `/api/stripe/webhook`     | `POST` | Stripe-signed     | Accepts and verifies subscription lifecycle events.                     |
| `/api/metrc/sync`         | `POST` | Entitled facility | Starts a scoped manual Metrc sync.                                      |
| `/api/metrc/status`       | `GET`  | Entitled facility | Returns dashboard sync, inventory, severity, risk, and trend metrics.   |
| `/api/logs/create`        | `POST` | Entitled facility | Creates a validated physical count, damage/discard, or lab-result log.  |
| `/api/discrepancies/list` | `GET`  | Entitled facility | Lists facility-scoped discrepancies with filters.                       |
| `/api/reports/generate`   | `GET`  | Entitled facility | Streams a date-range PDF or CSV reconciliation report.                  |

Authenticated REST failures use a stable `{ error, code }` response envelope. Validation failures additionally provide a safe `details` object.

## Operations

### Metrc synchronization

The system persists independent Metrc upserts in bounded batches to reduce serial synchronization time. Scheduled synchronization includes overlap/idempotency protection. Facilities remain responsible for confirming sync output and completing their own regulatory actions.

### Reconciliation rules

The discrepancy engine compares the latest synchronized Metrc package quantity with the latest physical count. A record is flagged when the absolute difference is greater than five units **or** the percentage variance is greater than five percent. Severity escalates by variance percentage: critical over 20%, high over 10%, and medium below that threshold while still flagged.

### Caching guidance

For larger facilities, use a short-lived cache for dashboard summaries and invalidate it after a Metrc sync, physical-log submission, or discrepancy resolution. Do not cache decrypted credentials, session-derived facility authorization, or Stripe webhook signature material.

## Quality checks

Run these commands before submitting a code change:

```bash
pnpm format   # Apply Prettier to source and documentation
pnpm check    # Run TypeScript validation
pnpm test     # Run Vitest unit and route tests
pnpm build    # Build the client and server production bundles
node scripts/verify-landing-keyboard.mjs  # Verify live landing-page Tab order
```

The browser keyboard script launches an isolated headless Chromium session against the local development server. It verifies the initial focus order for the brand-home control, header section links, sign-in/audit actions, and hero calls to action.

## Deployment

Before publishing, run the checks above, review migrations, configure secrets through the managed secret manager, and save a project checkpoint. On the managed platform, publishing is intentionally user-controlled: select **Publish** from the project interface after a successful checkpoint.

After release, perform a controlled operational validation:

1. Connect a non-production Metrc facility and run a manual sync.
2. Create a physical count and confirm expected discrepancies appear.
3. Export a PDF and CSV reconciliation report.
4. Run a Stripe test-mode Checkout trial using a test card and confirm the webhook updates billing status.
5. Verify the customer portal opens for a facility with a Stripe customer record.
6. Configure Resend only after the sending domain is verified, then test a controlled high-severity notification.

## Documentation

| Document                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| [`docs/api-contract.md`](docs/api-contract.md)                                 | REST request and response contract.                                            |
| [`docs/environment-reference.md`](docs/environment-reference.md)               | Managed runtime variables and Stripe webhook configuration.                    |
| [`docs/integration-research.md`](docs/integration-research.md)                 | External integration notes and constraints.                                    |
| [`docs/postgresql-schema.sql`](docs/postgresql-schema.sql)                     | Portable PostgreSQL domain-model reference.                                    |
| [`docs/landing-verification.md`](docs/landing-verification.md)                 | Landing-page responsive and keyboard-accessibility verification record.        |
| [`docs/privacy-contact-verification.md`](docs/privacy-contact-verification.md) | Cookie-consent, public contact-request, and privacy-route verification record. |
| [`client/src/pages/Terms.tsx`](client/src/pages/Terms.tsx)                     | Draft public Terms of Service displayed at `/terms`.                           |
| [`client/src/pages/Privacy.tsx`](client/src/pages/Privacy.tsx)                 | Draft public Privacy Policy displayed at `/privacy`.                           |

## Security and support

Keep repository access restricted, do not commit secrets, rotate exposed credentials immediately, and use Stripe’s test environment for checkout validation. Report application security concerns privately to the repository owner rather than creating a public issue with sensitive details.

## License

This repository is distributed under the proprietary **MetrcMatch Private-Use License**. It is not open source. Review [`LICENSE`](LICENSE) before accessing, copying, modifying, or distributing any part of the project. The public Terms of Service and Privacy Policy are available at `/terms` and `/privacy`, with privacy requests and general inquiries at `/contact`. The documents identify **Rocky Hayes** as the contact at [hayesrocky64@gmail.com](mailto:hayesrocky64@gmail.com) and remain drafts for qualified counsel review before public launch.

Copyright © 2026 MetrcMatch. All rights reserved.
