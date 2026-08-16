# MetrcMatch API and Database Contract

## Runtime note

The requested domain model is portable to PostgreSQL, but the initialized Manus full-stack project is provisioned with a MySQL/TiDB-compatible Drizzle adapter. Runtime schema definitions therefore use Drizzle’s MySQL core while retaining the requested entities and field semantics. The REST route contract below is Express-compatible and can be moved to PostgreSQL without changing the HTTP surface.

## PostgreSQL-oriented schema

The production PostgreSQL equivalent is represented by the following normalized tables. All timestamps should be stored as `timestamptz` in UTC, quantities as `numeric(14,3)`, percentages as `numeric(8,2)`, and enum values as `CHECK` constraints or PostgreSQL enums.

| Table | Purpose | Key fields |
|---|---|---|
| `users` | Authenticated application users | `id`, `email`, `password_hash`, `name`, `role`, timestamps |
| `facilities` | Oregon retail facility metadata | `id`, `name`, `license_number`, `address`, `timezone`, `compliance_manager_email` |
| `facility_members` | Facility-scoped authorization | `facility_id`, `user_id`, `role` |
| `metrc_connections` | Encrypted Metrc credentials and connection state | `facility_id`, `auth_method`, encrypted API keys, `api_base_url`, `last_synced_at` |
| `metrc_syncs` | Audit trail for inventory, sales, and testing pulls | `facility_id`, `trigger`, `status`, record counts, timestamps, error summary |
| `inventory_snapshots` | Latest Metrc inventory packages | `facility_id`, `metrc_package_id`, `product_name`, `sku`, `quantity`, `testing_status` |
| `physical_logs` | Counts, damages, discards, and lab results | `facility_id`, `created_by_user_id`, `type`, `quantity`, `reason`, `test_status`, timestamps |
| `discrepancies` | Variances and resolution state | `facility_id`, package ID, Metrc/physical quantities, variance, severity, status, notes |
| `reconciliation_reports` | Prepared period reports | `facility_id`, preparer, period, counts, severity totals |
| `notification_events` | Critical/high/red escalation history | `facility_id`, event type, recipient, delivery status, detail |

The runtime schema is in `drizzle/schema.ts`, and the initial migration is in `drizzle/0001_stiff_malcolm_colcord.sql`. The password-hash field is present in the provisioned `users` table and represented in the TypeScript schema as `passwordHash`.

## Express route structure

| Route | Auth | Behavior |
|---|---|---|
| `POST /api/auth/signup` | Public | Validates email/name/password, hashes the password with bcrypt, creates a local user, and issues the project session cookie. |
| `POST /api/auth/login` | Public | Verifies the bcrypt hash and issues the project session cookie. |
| `POST /api/metrc/sync` | Session | Resolves the caller’s facility and runs the same inventory/sales/testing sync service used by the typed UI procedure. |
| `POST /api/scheduled/metrc-sync` | Heartbeat session | Runs the scheduled facility sync with cron-session validation. |
| `GET /api/reports/export` | Session | Streams PDF or CSV reconciliation exports. |
| `/api/trpc/*` | Session per procedure | Typed endpoints for facility settings, logs, discrepancies, reports, and Metrc connection management. |
| `/api/oauth/callback` | OAuth callback | Existing managed Manus OAuth flow. |

The REST route implementations are in `server/routes/auth.ts` and `server/routes/metrc.ts`. The existing typed procedures remain the preferred browser contract because they provide end-to-end types and facility authorization.

## `POST /api/auth/signup`

Request body:

```json
{
  "name": "Compliance Manager",
  "email": "manager@example.com",
  "password": "correct horse battery staple"
}
```

The endpoint returns `201` with `{ "user": { ... } }` and sets the HTTP-only session cookie. It returns `400` for invalid input, `409` for a duplicate email, and `500` for an unavailable database.

## `POST /api/auth/login`

Request body:

```json
{
  "email": "manager@example.com",
  "password": "correct horse battery staple"
}
```

The endpoint returns `200` with the public user projection and sets the HTTP-only session cookie. Invalid credentials return `401` without revealing whether the email exists.

## `POST /api/metrc/sync`

No credentials are sent in the request body. Metrc credentials are saved through the authenticated settings procedure, encrypted server-side, and loaded for the facility owning the session.

```bash
curl -X POST https://your-host.example/api/metrc/sync \
  -H 'Content-Type: application/json' \
  -H 'Cookie: manus_session=<session-cookie>'
```

Success response:

```json
{
  "success": true,
  "facilityId": 42,
  "inventoryItems": 184,
  "salesRecords": 73,
  "discrepancies": 4
}
```

Metrc connection failures are recorded in `metrc_syncs`, mark the facility connection as errored, and return `502` with a safe error envelope. Missing connection settings return `409`, and missing authentication returns `401`.

## Environment configuration example

Copy the example into the deployment secret manager rather than committing a real `.env` file.

```dotenv
# Managed application/runtime settings
DATABASE_URL=mysql://user:password@host/database
JWT_SECRET=replace-with-a-long-random-session-secret
VITE_APP_ID=replace-with-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Optional transactional alerts
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=MetrcMatch <alerts@your-verified-domain.example>

# Optional Metrc defaults; facility credentials are stored per facility in the database
METRC_API_BASE_URL=https://api-or.metrc.com
METRC_REQUEST_TIMEOUT_MS=15000
```

The application does not hardcode API keys. The optional Resend variables are intentionally absent from the live project because the previous secrets request was rejected; alert events are retained with `suppressed` delivery status until an approved provider is configured.

## API security notes

All Metrc access is facility-scoped. API keys are encrypted before persistence and are never returned to the browser after save. Signup and login use bcrypt password hashes and the project’s existing signed HTTP-only session cookie. Rate limiting, CSRF protection for non-cookie clients, and a managed PostgreSQL deployment should be added before exposing the local-account endpoints to the public internet.
