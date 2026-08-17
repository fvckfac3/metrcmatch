# MetrcMatch

MetrcMatch is a compliance-oriented reconciliation workspace for Oregon retail cannabis facilities. It combines facility-scoped Metrc inventory synchronization, mobile physical logging, discrepancy detection, and PDF/CSV reconciliation reports.

## Architecture

| Layer       | Implementation                                 | Responsibility                                                                                  |
| ----------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Client      | React 19, Tailwind 4, shadcn/ui, tRPC client   | Responsive compliance workspace and operational workflows.                                      |
| Server      | Express 4, tRPC 11, Zod                        | REST endpoints, typed procedures, request validation, and session enforcement.                  |
| Data        | Drizzle ORM with MySQL/TiDB-compatible runtime | Facility-scoped inventory, logs, discrepancies, sync history, reports, and notification events. |
| Integration | Metrc API client                               | Inventory, sales, and lab-result pulls using encrypted per-facility credentials.                |

> The repository also contains a portable PostgreSQL domain reference at [`docs/postgresql-schema.sql`](docs/postgresql-schema.sql). The managed project runtime currently uses the provisioned MySQL/TiDB-compatible adapter in `drizzle/schema.ts`.

## Local setup

Use Node.js 22+ and pnpm 10+. Install dependencies and provide only development-safe values locally through your secret manager or an untracked local `.env` file.

```bash
pnpm install
pnpm dev
```

The development server starts from `server/_core/index.ts`. The managed project already provides the database and OAuth settings in its hosted environment; do not commit real credentials to `.env` files. This repository intentionally does not include a `.env.example`, because project secrets are managed through the platform; use [`docs/environment-reference.md`](docs/environment-reference.md) as the configuration reference.

The supported pnpm overrides and patch declarations live in `pnpm-workspace.yaml`. They must remain there rather than in the legacy `pnpm` field of `package.json`; current pnpm releases ignore that manifest field and emit a warning when it is present.

## Environment configuration

| Variable                   | Required in production | Purpose                                                               |
| -------------------------- | ---------------------: | --------------------------------------------------------------------- |
| `DATABASE_URL`             |                    Yes | Managed MySQL/TiDB database connection.                               |
| `JWT_SECRET`               |                    Yes | Signs HTTP-only session cookies.                                      |
| `VITE_APP_ID`              |                    Yes | Manus OAuth application identifier.                                   |
| `OAUTH_SERVER_URL`         |                    Yes | OAuth backend URL.                                                    |
| `METRC_REQUEST_TIMEOUT_MS` |                     No | Positive integer timeout for Metrc API requests; defaults to `15000`. |
| `RESEND_API_KEY`           |                     No | Enables alert email delivery after a sender is verified.              |
| `RESEND_FROM_EMAIL`        |                     No | Verified sender used for alert email delivery.                        |

Production startup now validates the required runtime variables before listening. Facility-specific Metrc keys are entered in the application, encrypted before persistence, and never returned to the client.

## Commands

```bash
pnpm test      # Run Vitest unit and route tests
pnpm check     # Run TypeScript validation
pnpm build     # Build the production client and server bundle
pnpm format    # Apply Prettier formatting
```

Schema changes must follow the project workflow: update `drizzle/schema.ts`, generate the migration with `pnpm drizzle-kit generate`, review the generated SQL, then apply it through the managed database migration action. Do not run destructive schema commands against production without a reviewed backup and migration plan.

## REST API

The current REST routes are documented in [`docs/api-contract.md`](docs/api-contract.md). Browser screens primarily use typed tRPC procedures, while REST endpoints support interoperability and report downloads.

| Route                     | Method | Purpose                                                                        |
| ------------------------- | ------ | ------------------------------------------------------------------------------ |
| `/api/auth/signup`        | `POST` | Creates a local account and issues an HTTP-only session cookie.                |
| `/api/auth/login`         | `POST` | Authenticates a local account and issues an HTTP-only session cookie.          |
| `/api/metrc/sync`         | `POST` | Starts a facility-scoped manual Metrc sync.                                    |
| `/api/metrc/status`       | `GET`  | Returns dashboard sync, inventory, risk, severity, and trend metrics.          |
| `/api/logs/create`        | `POST` | Creates a validated physical count, damage/discard, or lab-result log.         |
| `/api/discrepancies/list` | `GET`  | Lists facility-scoped discrepancies with optional status and severity filters. |
| `/api/reports/generate`   | `GET`  | Streams a date-range PDF or CSV report.                                        |

All authenticated REST errors use a stable `{ error, code }` envelope. Validation errors additionally include a safe `details` object.

## Performance and operations

The synchronization persistence helpers process independent Metrc record upserts in bounded batches of 25 rather than serially. Physical-log search filters now execute in the database instead of filtering an already fetched result set in JavaScript.

For larger production facilities, add indexes that follow real query patterns—particularly facility plus timestamp for logs, syncs, and discrepancies—and use a short-lived cache for dashboard summaries. Invalidate that cache after a Metrc sync, physical log submission, or discrepancy resolution. Do not cache decrypted credentials or session-derived facility authorization.

## Deployment

Before release, run `pnpm test`, `pnpm check`, and `pnpm build`. Configure required values through the project’s secret manager, review database migrations, then create a checkpoint. To release through the managed platform, use the **Publish** button in the project interface after a successful checkpoint; publishing is intentionally a user-controlled operation.

After deployment, connect a non-production Metrc facility first, verify a manual sync, submit a physical count, review generated discrepancies, and download a reconciliation report. Configure Resend only after the sender domain is verified, then verify alert delivery with a controlled high-severity scenario.
