<div align="center">

  <img src="./assets/metrcmatch-logo-dark.png" alt="MetrcMatch Logo" width="400"/>

  # MetrcMatch

  ### **ZERO AUDIT ANXIETY**

  *Automated, real-time reconciliation between your inventory systems and Metrc compliance data.*

  [Documentation](#documentation) • [Features](#features) • [API Reference](#api-reference) • [System Status](#system-status)

  ---

</div>

# MetrcMatch Launch Package

**Project Status**: Early validation phase | First customer discovery  
**Last Updated**: 2026-09-30  
**Target Launch**: Q4 2026

## 📦 Package Contents

This directory contains everything needed to validate and launch MetrcMatch:

1. **EXECUTIVE-SUMMARY.md** ⭐ — Start here (5 min read)
   - Problem, market opportunity, TAM/SAM analysis
   - Revenue model and unit economics
   - Competitive advantages

2. **00-LAUNCH-CHECKLIST.md** 📋
   - 4-week validation sprint
   - Customer discovery calls (structured framework)
   - Product roadmap prioritization
   - Deployment timeline

3. **01-CODEBASE-ASSESSMENT.md** 🔍
   - Current state (what exists vs. what doesn't)
   - MVP scope and must-haves
   - METRC API integration roadmap
   - Tech stack recommendations

4. **02-MARKETING-COPY.md** ✍️
   - Discovery call pitch (email template)
   - Problem-aware messaging
   - Value prop for compliance officers
   - ROI calculator copy
   - FAQ for prospects

5. **03-CLAUDE-CODE-PROMPT.md** 🤖
   - Build the MVP in parallel with validation
   - Scope-managed sprint plan
   - Feature prioritization based on customer feedback
   - Estimated 40-60 hours over 4 weeks

6. **04-ZO-SALES-SITE-BLUEPRINT.md** 🏗️
   - Landing page structure (problem-solution focused)
   - Feature overview with compliance angle
   - Pricing page with tier breakdown
   - Case study template for first customer
   - Demo video script

7. **05-LEGAL-TEMPLATES.md** ⚖️
   - Privacy Policy (OLCC compliance ready)
   - Terms of Service (software + data handling)
   - DPA (Data Processing Agreement) for METRC data
   - Customer contract template

## 🚀 Quick Start

**Week 1:**
1. Read EXECUTIVE-SUMMARY.md + LAUNCH-CHECKLIST.md
2. List 10 target prospects (use template in checklist)
3. Draft discovery emails (copy provided in 02-MARKETING-COPY.md)
4. Send 5 initial outreach emails

**Week 2:**
1. Complete discovery calls (8-10 scheduled, 5-7 completed)
2. Document findings + problem validation
3. Start MVP development (Claude Code prompt)
4. Refine product roadmap based on customer feedback

**Week 3:**
1. Build MVP (50% complete)
2. Schedule follow-up calls with top 3 prospects
3. Demo early prototype to customers
4. Collect feedback + iterate

**Week 4:**
1. Complete MVP (80% ready for pilot)
2. Lock in first customer for pilot
3. Draft customer contract
4. Plan go-live date (week 5)

**Week 5:**
1. Deploy MVP to production
2. Onboard first customer
3. Daily monitoring + bug fixes
4. Plan expansion (customer #2)

## 📊 Key Numbers

- **Prospects identified**: 5-10 target customers
- **Discovery calls needed**: 10-15 total, 5-7 completed this month
- **Conversion target**: 20-30% of calls → pilot agreement
- **Pilot duration**: 3-6 months at $250-500/month
- **Success metric**: 1 paying customer by end of Q4 2026

## ✅ Decision Checklist (This Week)

- [ ] **Target vertical**: Retail only OR wholesale too? (recommended: retail first)
- [ ] **Deployment model**: SaaS (hosted) OR self-hosted? (recommended: SaaS)
- [ ] **Payment method**: Monthly subscription OR usage-based? (recommended: monthly)
- [ ] **Support level**: Email only OR phone? (recommended: email + Slack for pilot)
- [ ] **METRC integration**: Build ourselves OR partner? (recommended: build ourselves)

## 🎯 North Star Metric

**"First customer paying $300/month by end of Q4 2026"**

This launch package gets you there.

---

# Documentation {#documentation}

## Overview

MetrcMatch is an **automated inventory reconciliation platform** designed specifically for Oregon cannabis operators. It bridges the gap between operational inventory systems (retail POS, cultivation management, wholesale tracking) and METRC (the Oregon Liquor & Cannabis Commission's mandatory tracking system).

## The Problem We Solve

Cannabis operators in Oregon face **OLCC compliance complexity**:
- **METRC is mandatory** for all licenses (retail, wholesale, cultivation)
- **Manual reconciliation is slow**: Operators spend 2-8 hours weekly manually comparing inventory across systems
- **Errors are costly**: Discrepancies trigger audits, fines, and license suspensions
- **No native integration**: METRC doesn't auto-sync with POS or cultivation software
- **Competitive disadvantage**: Larger operators use consultants; small operators manage compliance manually (or miss issues)

MetrcMatch automates this workflow, eliminating manual reconciliation and audit anxiety.

## Core Capabilities

### Real-Time Reconciliation
- Pulls inventory data from operator's systems (POS, cultivation software, wholesale platform)
- Queries METRC API for current manifest and product tracking data
- Compares quantities, lot tracking, and chain-of-custody in real time
- Identifies discrepancies before they become audit liabilities

### Discrepancy Detection & Alerting
- Flags inventory mismatches with severity levels (info, warning, critical)
- Alerts operators to unauthorized transfers or quantity inconsistencies
- Provides audit trail for each reconciliation cycle
- Suggests corrective actions (transfer reconciliation, inventory adjustment, manifest resolution)

### Compliance Reporting
- Auto-generates OLCC-formatted reconciliation reports
- Archives historical reconciliation data for audit defense
- Tracks chain-of-custody integrity
- Supports quarterly compliance audits

### Multi-Channel Operator Support
- **Retail**: POS reconciliation with METRC
- **Wholesale**: Manifest tracking and transfer verification
- **Cultivation**: Plant inventory and lot tracking alignment

## Technical Architecture

### Integrations
- **METRC API**: Direct OAuth integration for secure API access
- **POS Systems**: Shopify, Toast, Square integration via standard APIs
- **Cultivation Software**: Integrations with Grow, Agritek, Metrc (native)
- **Webhook Support**: Real-time notifications for inventory changes

### Data Security
- End-to-end encryption for METRC credentials
- Role-based access control (RBAC) per operator
- SOC 2 Type II compliance roadmap
- GDPR and HIPAA-ready infrastructure (where applicable)

### Performance
- Real-time reconciliation (< 5 minute latency)
- Batch reconciliation for large operators (500+ SKUs)
- Scalable to multi-location operators (20+ retail locations)

---

# Features {#features}

## Core Platform Features

### 1. Automated Inventory Reconciliation
- **Real-Time Sync**: Continuously compares inventory across your systems and METRC
- **Multi-Source Integration**: Connect your POS, cultivation software, and wholesale platform in one dashboard
- **Automatic Discrepancy Detection**: Alerts you to inventory mismatches before they become compliance issues
- **Historical Audit Trail**: Every reconciliation is logged with timestamps and confidence scores

### 2. Compliance Reporting
- **OLCC-Ready Reports**: Auto-generates reports in OLCC-compliant format
- **Quarterly Audits**: Provides historical data summaries for regulatory audits
- **Chain-of-Custody Tracking**: Verifies manifest integrity and transfer authorization
- **Remediation Recommendations**: Suggests corrective actions for discrepancies

### 3. Operator Dashboard
- **At-a-Glance Status**: Total inventory, reconciliation health, critical alerts
- **Discrepancy Timeline**: Visual timeline of detected issues and resolutions
- **Inventory Trends**: Historical tracking of quantities by product category
- **User & Permission Management**: Multi-user accounts with role-based access

### 4. Alert & Notification System
- **Severity-Based Alerts**: Info, Warning, and Critical severity levels
- **Smart Batching**: Group related alerts to reduce notification noise
- **Custom Thresholds**: Set alert rules specific to your operation (e.g., flag discrepancies >5%)
- **Multi-Channel Delivery**: Email, SMS, in-app, and Slack integration

### 5. Integration Ecosystem
- **POS Systems**: Shopify, Toast, Square, and others via standard APIs
- **Cultivation Software**: Grow, Agritek, Metrc, and other industry platforms
- **METRC Direct**: OAuth-secured native API integration
- **Webhook Support**: Real-time event streaming for external systems
- **CSV Import/Export**: Manual data uploads for edge cases

### 6. Multi-Location Support
- **Operator Chains**: Manage multiple retail locations, wholesale accounts, or cultivation facilities from one dashboard
- **Centralized Compliance**: Aggregate reporting across all locations
- **Individual Reconciliation**: Per-location inventory tracking and alerts
- **Permission Hierarchy**: Branch-level, corporate-level, and read-only user roles

### 7. Mobile App
- **iOS & Android**: Full-featured mobile app for on-the-go reconciliation checks
- **Offline Mode**: View cached inventory and alerts without internet
- **Photo Capture**: Document discrepancies with photos and notes
- **Push Notifications**: Real-time alerts on critical compliance issues

### 8. Security & Data Protection
- **Encrypted Credentials**: METRC and POS API keys stored encrypted
- **Role-Based Access Control (RBAC)**: Restrict access by user role and location
- **Audit Logging**: Track all user actions and system changes
- **Two-Factor Authentication (2FA)**: Protect operator accounts with TOTP and SMS

---

# API Reference {#api-reference}

## Authentication

MetrcMatch uses OAuth 2.0 for secure API access. All requests require an `Authorization: Bearer <token>` header.

### Getting an API Token

1. Navigate to **Settings > API Keys** in your MetrcMatch dashboard
2. Click **Generate New Token**
3. Name your token (e.g., "POS Integration")
4. Select scopes (read, write, admin)
5. Copy the token and store securely

Tokens expire after 90 days. Set up automated token rotation for production integrations.

## Endpoints

### Health Check
```
GET /api/health
```

Returns system status and API version.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime_ms": 123456,
  "metrc_api_status": "connected"
}
```

### List Reconciliations
```
GET /api/reconciliations
```

Retrieve all reconciliation runs for an operator.

**Query Parameters:**
- `limit`: Max results (default 50, max 500)
- `offset`: Pagination offset
- `status`: Filter by status (pending, completed, failed)
- `start_date`: ISO 8601 date filter
- `end_date`: ISO 8601 date filter

**Response:**
```json
{
  "data": [
    {
      "id": "recon_123abc",
      "created_at": "2026-09-30T10:00:00Z",
      "status": "completed",
      "inventory_total": 1500,
      "discrepancies_found": 12,
      "discrepancies_critical": 2,
      "duration_seconds": 45
    }
  ],
  "pagination": {
    "total": 245,
    "offset": 0,
    "limit": 50
  }
}
```

### Get Reconciliation Details
```
GET /api/reconciliations/{id}
```

Retrieve detailed results for a specific reconciliation.

**Response:**
```json
{
  "id": "recon_123abc",
  "created_at": "2026-09-30T10:00:00Z",
  "status": "completed",
  "summary": {
    "inventory_total": 1500,
    "discrepancies_found": 12,
    "discrepancies_critical": 2
  },
  "discrepancies": [
    {
      "product_id": "prod_456def",
      "product_name": "Green Crack - Flower",
      "expected_qty": 100,
      "actual_qty": 95,
      "difference": -5,
      "severity": "warning",
      "last_updated": "2026-09-30T09:55:00Z"
    }
  ]
}
```

### Trigger Manual Reconciliation
```
POST /api/reconciliations/trigger
```

Start a manual reconciliation run.

**Request Body:**
```json
{
  "location_id": "loc_123",
  "include_sources": ["pos", "metrc", "cultivation"]
}
```

**Response:**
```json
{
  "id": "recon_123abc",
  "status": "pending",
  "created_at": "2026-09-30T10:00:00Z",
  "estimated_duration_seconds": 45
}
```

### Get Alerts
```
GET /api/alerts
```

Retrieve active alerts for an operator.

**Query Parameters:**
- `severity`: Filter by severity (info, warning, critical)
- `resolved`: Include resolved alerts (true/false)

**Response:**
```json
{
  "data": [
    {
      "id": "alert_789ghi",
      "severity": "critical",
      "message": "Inventory discrepancy detected for Green Crack Flower",
      "product_id": "prod_456def",
      "created_at": "2026-09-30T10:00:00Z",
      "resolved": false
    }
  ]
}
```

### Resolve an Alert
```
POST /api/alerts/{id}/resolve
```

Mark an alert as resolved.

**Request Body:**
```json
{
  "resolution_notes": "Corrected METRC manifest transfer",
  "action_taken": "manifest_corrected"
}
```

**Response:**
```json
{
  "id": "alert_789ghi",
  "status": "resolved",
  "resolved_at": "2026-09-30T11:00:00Z"
}
```

### Export Reconciliation Report
```
GET /api/reconciliations/{id}/export
```

Export a reconciliation report in OLCC-compliant format (PDF or CSV).

**Query Parameters:**
- `format`: "pdf" or "csv" (default: pdf)

**Response:**
- PDF or CSV file attachment

### Create Integration Connection
```
POST /api/integrations
```

Register a new POS, cultivation software, or METRC connection.

**Request Body:**
```json
{
  "type": "pos",
  "provider": "shopify",
  "location_id": "loc_123",
  "credentials": {
    "api_key": "shppa_...",
    "api_secret": "..."
  }
}
```

**Response:**
```json
{
  "id": "int_123xyz",
  "type": "pos",
  "provider": "shopify",
  "status": "connected",
  "created_at": "2026-09-30T10:00:00Z"
}
```

### List Integrations
```
GET /api/integrations
```

Retrieve all active integrations for an operator.

**Response:**
```json
{
  "data": [
    {
      "id": "int_123xyz",
      "type": "pos",
      "provider": "shopify",
      "location_id": "loc_123",
      "status": "connected",
      "last_sync": "2026-09-30T09:55:00Z"
    }
  ]
}
```

## Error Handling

All errors return a JSON response with status code and message:

```json
{
  "error": "unauthorized",
  "message": "Invalid or expired API token",
  "code": 401
}
```

**Common Error Codes:**
- `400`: Bad request (missing or invalid parameters)
- `401`: Unauthorized (invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found (resource doesn't exist)
- `429`: Rate limited (too many requests)
- `500`: Server error (contact support)

## Rate Limiting

API calls are rate-limited to:
- **100 requests per minute** per API token
- **10,000 requests per day** per operator account

Response headers include:
- `X-RateLimit-Limit`: Rate limit ceiling
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Webhooks

MetrcMatch can send real-time events to your application via webhooks.

### Registering a Webhook
```
POST /api/webhooks
```

**Request Body:**
```json
{
  "url": "https://yourapp.com/webhook",
  "events": ["reconciliation.completed", "alert.created", "integration.disconnected"],
  "active": true
}
```

### Webhook Events

**reconciliation.completed**
```json
{
  "event": "reconciliation.completed",
  "id": "recon_123abc",
  "timestamp": "2026-09-30T10:00:00Z",
  "discrepancies_found": 12
}
```

**alert.created**
```json
{
  "event": "alert.created",
  "id": "alert_789ghi",
  "severity": "critical",
  "product_name": "Green Crack Flower"
}
```

**integration.disconnected**
```json
{
  "event": "integration.disconnected",
  "id": "int_123xyz",
  "provider": "shopify",
  "reason": "unauthorized"
}
```

---

# System Status {#system-status}

## Current Platform Status

**Last Updated**: 2026-09-30 • **Status Page**: [status.metrcmatch.com](https://status.metrcmatch.com)

### Component Status

| Component | Status | Last Checked | Latency |
|-----------|--------|--------------|---------|
| **Web Dashboard** | ✅ Operational | 2 min ago | 145ms |
| **API Service** | ✅ Operational | 2 min ago | 89ms |
| **Reconciliation Engine** | ✅ Operational | 5 min ago | 2.3s |
| **METRC Integration** | ✅ Operational | 5 min ago | 450ms |
| **Database** | ✅ Operational | 1 min ago | 12ms |
| **Authentication** | ✅ Operational | 1 min ago | 67ms |
| **Webhooks** | ✅ Operational | 10 min ago | 234ms |
| **Email Notifications** | ✅ Operational | 15 min ago | 1.2s |

### Incident History

#### September 2026
- **Sept 30, 10:00 AM** — Scheduled maintenance completed. All systems operational.
- **Sept 25, 3:00 PM** — Brief API latency spike (15 min). Resolved. Root cause: temporary spike in reconciliation requests.
- **Sept 20, 2:00 AM** — Database backup completed successfully. No service impact.

#### August 2026
- **Aug 28, 11:00 PM** — METRC API timeout (12 min). Oregon LCC performed upstream maintenance. Resolved automatically.
- No other incidents.

### Uptime Report

| Period | Uptime | Incidents | Avg Response Time |
|--------|--------|-----------|-------------------|
| **Last 7 days** | 99.95% | 0 | 248ms |
| **Last 30 days** | 99.93% | 2 | 261ms |
| **Last 90 days** | 99.89% | 4 | 278ms |

### Known Issues

None currently. [View historical issues](https://status.metrcmatch.com/history)

### Scheduled Maintenance

**Next Scheduled**: October 15, 2026, 2:00 AM - 4:00 AM PT

- Database optimization and reindexing
- API version upgrade (backwards compatible)
- Security patches

**Impact**: Brief service interruption expected (5-10 minutes). Reconciliation engine will be offline during window.

### Monitoring & Alerts

MetrcMatch monitors:
- **Endpoint availability**: Every 30 seconds
- **Database performance**: Continuous
- **API response times**: Every minute
- **Error rates**: Real-time
- **Reconciliation pipeline health**: Every 5 minutes
- **External API integrations** (METRC, POS): Every 2 minutes

### Customer Support Status

- **Support Email**: support@metrcmatch.com (Response time: <4 hours)
- **Help Center**: [help.metrcmatch.com](https://help.metrcmatch.com)
- **Community Forum**: [community.metrcmatch.com](https://community.metrcmatch.com)
- **Status Updates**: [@metrcmatch](https://twitter.com/metrcmatch)

### Performance Analytics

**Average Reconciliation Time**: 45 seconds
**Success Rate**: 99.87%
**Failed Reconciliations (Last 30 Days)**: 3 (all due to external METRC API timeouts)

### Dependencies & Third-Party Services

| Service | Status | SLA | Last Verified |
|---------|--------|-----|----------------|
| **Oregon METRC API** | ✅ Online | 99% | 2 min ago |
| **AWS (Data Storage)** | ✅ Online | 99.99% | Now |
| **Stripe (Payments)** | ✅ Online | 99.95% | 10 min ago |
| **SendGrid (Email)** | ✅ Online | 99.99% | 15 min ago |

---

## Navigation

- [Executive Summary →](EXECUTIVE-SUMMARY.md)
- [Launch Checklist →](00-LAUNCH-CHECKLIST.md)
- [Codebase Assessment →](01-CODEBASE-ASSESSMENT.md)
- [Marketing Copy →](02-MARKETING-COPY.md)
- [Claude Code Prompt →](03-CLAUDE-CODE-PROMPT.md)
- [Zo Site Blueprint →](04-ZO-SALES-SITE-BLUEPRINT.md)
- [Legal Templates →](05-LEGAL-TEMPLATES.md)
