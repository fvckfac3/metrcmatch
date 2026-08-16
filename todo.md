# Project TODO

- [ ] Define the Oregon retail facility, Metrc inventory snapshot, physical log, discrepancy, report, sync history, and notification data model.
- [ ] Apply the database migration and verify all reconciliation tables and enums exist.
- [ ] Implement protected facility-scoped backend procedures with input validation and ownership checks.
- [ ] Build encrypted-at-rest Metrc credential management with connection testing, manual sync, last-sync status, and the latest ten sync records.
- [ ] Implement inventory snapshot ingestion and a deterministic discrepancy detection service using the specified variance thresholds and severity tiers.
- [ ] Build discrepancy causes, resolution statuses, timeline, filters, sorting, and resolution notes.
- [ ] Build mobile-first physical count, damage/discard, and lab-test logging forms with product search, validation, auto-generated timestamps, and confirmations.
- [ ] Build a manager dashboard with reconciliation summary, audit-risk status, trend chart, risk-ranked discrepancies, and primary actions.
- [ ] Build reporting views and PDF/CSV reconciliation exports with facility metadata and preparer fields.
- [ ] Add Oregon-focused onboarding and compliance context with clearly labeled advisory guidance and links to official sources.
- [ ] Implement the authenticated nightly sync callback, idempotency safeguards, and a deploy-ready schedule configuration workflow.
- [ ] Implement Critical/High discrepancy and red audit-risk alert events, plus compliance-manager email delivery once an email provider credential is supplied.
- [ ] Add route-level and service-level Vitest coverage for validation, discrepancy rules, and risk calculations.
- [ ] Verify desktop and mobile layouts, run tests and type checks, and resolve any findings.
- [ ] Save a completion checkpoint and provide the completed project version with setup and deployment guidance.
- [ ] Document the requested PostgreSQL schema contract and map it to the project’s managed MySQL-compatible database adapter.
- [ ] Document the auth, Metrc, logs, discrepancies, and reports REST route structure and environment configuration example.
- [ ] Add an explicit authenticated `/api/metrc/sync` Express endpoint that reuses the typed sync service.
- [ ] Harden Metrc API-key settings, inventory/sales/testing sync persistence, timeout handling, and error responses.
- [ ] Add endpoint-level tests for the Metrc sync route and API-key error handling.
- [ ] Validate the updated API contract with tests and type checks.
- [ ] Save a checkpoint for the updated integration implementation.

## Implementation note

- [ ] The managed scaffold currently uses Manus OAuth and a MySQL/TiDB-compatible Drizzle adapter. The requested PostgreSQL table names and domain model will be documented as a portable contract while runtime persistence remains on the provisioned adapter unless the project is explicitly migrated to PostgreSQL.
- [ ] Email alert credentials were not configured because the previous secrets request was rejected; alert events remain safely suppressed until a provider is configured.
> 
> Note: the items above are new scope requested after the initial application implementation and are intentionally retained as project history.
> 
> 
