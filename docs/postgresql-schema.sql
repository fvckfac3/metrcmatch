-- MetrcMatch portable PostgreSQL reference schema.
-- Runtime deployment in this project uses Drizzle/MySQL-compatible tables in drizzle/schema.ts.

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email CITEXT NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  login_method VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_signed_in TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE facilities (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  license_number VARCHAR(100),
  address VARCHAR(500),
  timezone VARCHAR(64) NOT NULL DEFAULT 'America/Los_Angeles',
  compliance_manager_email CITEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE facility_members (
  facility_id BIGINT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'manager' CHECK (role IN ('manager', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (facility_id, user_id)
);

CREATE TABLE metrc_connections (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL UNIQUE REFERENCES facilities(id) ON DELETE CASCADE,
  auth_method VARCHAR(20) NOT NULL DEFAULT 'api_key' CHECK (auth_method IN ('api_key', 'oauth')),
  encrypted_user_api_key TEXT,
  encrypted_integrator_api_key TEXT,
  encrypted_oauth_client_id TEXT,
  encrypted_oauth_client_secret TEXT,
  api_base_url VARCHAR(500) NOT NULL DEFAULT 'https://api-or.metrc.com',
  license_number VARCHAR(100),
  connection_status VARCHAR(20) NOT NULL DEFAULT 'not_connected' CHECK (connection_status IN ('not_connected', 'connected', 'error')),
  last_tested_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  schedule_cron_task_uid VARCHAR(65),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE metrc_syncs (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  trigger VARCHAR(20) NOT NULL CHECK (trigger IN ('manual', 'scheduled')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  inventory_items INTEGER NOT NULL DEFAULT 0,
  sales_records INTEGER NOT NULL DEFAULT 0,
  test_records INTEGER NOT NULL DEFAULT 0,
  error_summary TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

CREATE TABLE inventory_snapshots (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  metrc_package_id VARCHAR(128) NOT NULL,
  package_label VARCHAR(255),
  product_name VARCHAR(500) NOT NULL,
  sku VARCHAR(255),
  quantity NUMERIC(14,3) NOT NULL,
  unit_of_measure VARCHAR(64) NOT NULL DEFAULT 'units',
  testing_status VARCHAR(100) NOT NULL DEFAULT 'Unknown',
  source_last_modified_at TIMESTAMPTZ,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (facility_id, metrc_package_id)
);

CREATE TABLE physical_logs (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  created_by_user_id BIGINT NOT NULL REFERENCES users(id),
  inventory_snapshot_id BIGINT REFERENCES inventory_snapshots(id),
  metrc_package_id VARCHAR(128),
  product_name VARCHAR(500) NOT NULL,
  sku VARCHAR(255),
  type VARCHAR(20) NOT NULL CHECK (type IN ('count', 'damage', 'discard', 'test_result')),
  quantity NUMERIC(14,3),
  location VARCHAR(255),
  reason VARCHAR(20) CHECK (reason IN ('broken', 'expired', 'theft', 'waste', 'other')),
  test_status VARCHAR(20) CHECK (test_status IN ('passed', 'failed')),
  received_at TIMESTAMPTZ,
  notes TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE discrepancies (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  inventory_snapshot_id BIGINT REFERENCES inventory_snapshots(id),
  metrc_package_id VARCHAR(128) NOT NULL,
  product_name VARCHAR(500) NOT NULL,
  sku VARCHAR(255),
  metrc_quantity NUMERIC(14,3) NOT NULL,
  physical_quantity NUMERIC(14,3),
  variance_quantity NUMERIC(14,3) NOT NULL,
  variance_percent NUMERIC(8,2) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium')),
  likely_cause VARCHAR(500) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'investigating' CHECK (status IN ('investigating', 'resolved', 'awaiting_lab', 'other')),
  resolution_notes TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (facility_id, metrc_package_id)
);

CREATE TABLE reconciliation_reports (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  prepared_by_user_id BIGINT NOT NULL REFERENCES users(id),
  prepared_by_name VARCHAR(255) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_items_reconciled INTEGER NOT NULL DEFAULT 0,
  discrepancies_found INTEGER NOT NULL DEFAULT 0,
  discrepancies_resolved INTEGER NOT NULL DEFAULT 0,
  outstanding_discrepancies INTEGER NOT NULL DEFAULT 0,
  critical_count INTEGER NOT NULL DEFAULT 0,
  high_count INTEGER NOT NULL DEFAULT 0,
  medium_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notification_events (
  id BIGSERIAL PRIMARY KEY,
  facility_id BIGINT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  discrepancy_id BIGINT REFERENCES discrepancies(id),
  type VARCHAR(32) NOT NULL CHECK (type IN ('critical_discrepancy', 'high_discrepancy', 'audit_risk_red')),
  recipient CITEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'suppressed', 'failed')),
  detail TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ
);

CREATE INDEX metrc_syncs_facility_started_idx ON metrc_syncs (facility_id, started_at DESC);
CREATE INDEX physical_logs_facility_occurred_idx ON physical_logs (facility_id, occurred_at DESC);
CREATE INDEX discrepancies_facility_severity_idx ON discrepancies (facility_id, severity);
CREATE INDEX reports_facility_created_idx ON reconciliation_reports (facility_id, created_at DESC);
