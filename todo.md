# Project TODO

- [x] Define the Oregon retail facility, Metrc inventory snapshot, physical log, discrepancy, report, sync history, and notification data model.
- [x] Apply the database migration and verify all reconciliation tables and enums exist.
- [x] Implement protected facility-scoped backend procedures with input validation and ownership checks.
- [x] Build encrypted-at-rest Metrc credential management with connection testing, manual sync, last-sync status, and the latest ten sync records.
- [x] Implement inventory snapshot ingestion and a deterministic discrepancy detection service using the specified variance thresholds and severity tiers.
- [x] Build discrepancy causes, resolution statuses, timeline, filters, sorting, and resolution notes.
- [x] Build mobile-first physical count, damage/discard, and lab-test logging forms with product search, validation, auto-generated timestamps, and confirmations.
- [x] Build a manager dashboard with reconciliation summary, audit-risk status, trend chart, risk-ranked discrepancies, and primary actions.
- [x] Build reporting views and PDF/CSV reconciliation exports with facility metadata and preparer fields.
- [x] Add Oregon-focused onboarding and compliance context with clearly labeled advisory guidance and links to official sources.
- [x] Implement the authenticated nightly sync callback, idempotency safeguards, and a deploy-ready schedule configuration workflow.
- [x] Implement Critical/High discrepancy and red audit-risk alert events, plus compliance-manager email delivery once an email provider credential is supplied.
- [x] Add route-level and service-level Vitest coverage for validation, discrepancy rules, and risk calculations.
- [x] Verify desktop and mobile layouts, run tests and type checks, and resolve any findings.
- [x] Save a completion checkpoint and provide the completed project version with setup and deployment guidance.
- [x] Document the requested PostgreSQL schema contract and map it to the project’s managed MySQL-compatible database adapter.
- [x] Document the auth, Metrc, logs, discrepancies, and reports REST route structure and environment configuration example.
- [x] Add an explicit authenticated `/api/metrc/sync` Express endpoint that reuses the typed sync service.
- [x] Harden Metrc API-key settings, inventory/sales/testing sync persistence, timeout handling, and error responses.
- [x] Add endpoint-level tests for the Metrc sync route and API-key error handling.
- [x] Validate the updated API contract with tests and type checks.
- [x] Save a checkpoint for the updated integration implementation.

## Implementation note

- [x] The managed scaffold currently uses Manus OAuth and a MySQL/TiDB-compatible Drizzle adapter. The requested PostgreSQL table names and domain model will be documented as a portable contract while runtime persistence remains on the provisioned adapter unless the project is explicitly migrated to PostgreSQL.
- [x] Email alert credentials were not configured because the previous secrets request was rejected; alert events remain safely suppressed until a provider is configured.
> 
> Note: the items above are new scope requested after the initial application implementation and are intentionally retained as project history.
> 
> 
- [x] Replace the hardcoded dashboard trend series with persisted sync/reconciliation history.
- [x] Add discrepancy sorting and a visible resolution timeline.
- [x] Add an Oregon OLCC onboarding explainer with official source links and threshold guidance.
- [x] Add and test scheduled-sync idempotency protection.
- [x] Add explicit testing-data sync and timeout/error-path coverage.
- [x] Add endpoint coverage for Metrc connection failure responses.
- [x] Verify the UI at a mobile viewport and record the result.
- [x] Save a checkpoint after the latest REST/auth integration and verification fixes.
- [x] Build a mobile-responsive React physical logging form for count, damage/discard, and lab-test results.
- [x] Add synced-Metrc product search and autocomplete with keyboard-accessible selection.
- [x] Add client and server validation for quantities, reasons, test status, dates, and required product fields.
- [x] Add an authenticated `POST /api/logs/create` endpoint that persists physical logs and triggers reconciliation.
- [x] Add clear submitting, success confirmation, and error states without inventing product data.
- [x] Add Vitest coverage for the log endpoint and validation contract.
- [x] Verify the logging UI at desktop and mobile viewports, then save a checkpoint.
- [x] Implement a deterministic per-product comparison of latest Metrc quantity versus latest physical count.
- [x] Flag discrepancies when variance exceeds 5 units or 5 percent and suggest testing delay, recent sale, damage logged, or no count causes.
- [x] Persist detected discrepancy results and clear resolved variances safely.
- [x] Add authenticated `GET /api/discrepancies/list` with facility scoping and status/severity filters.
- [x] Add discrepancy engine and endpoint tests, run type checks, and save a checkpoint.
