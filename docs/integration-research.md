# Integration and Compliance Research Notes

## Oregon OLCC tracking context

The Oregon Liquor and Cannabis Commission identifies Metrc as the state-administered Cannabis Tracking System. Its guidance states that facilities subject to tracking should perform **daily reconciliation** and timely reporting whenever an inventory change occurs; it also states that no “no activity” report is required when no inventory changes or transfers occur. The product should therefore present its status signals and recommended actions as operational support, not as a regulatory determination.

Official source: <https://www.oregon.gov/olcc/pages/ommp_cts_guide.aspx>

## Metrc API authentication and sync approach

Metrc’s Oregon Web API documentation states that requests require both a software integrator API key and a user API key. They are combined as `software_api_key:user_api_key`, Base64 encoded, and provided using HTTP Basic authentication. The integration connector should only create this authorization value server-side and should use incremental `LastModified`-based reads where applicable to reduce the need for bulk data retention.

Official source: <https://api-or.metrc.com/Documentation>

## Product guardrails

- Metrc credentials are secrets and must never be returned from application APIs or rendered in the browser.
- The product’s Critical, High, and Medium flags are internal operational thresholds, not asserted OLCC variance allowances.
- The interface must explain that MetrcMatch is advisory and that facility staff remain responsible for verification and required reporting.
