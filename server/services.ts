import type { MetrcConnection } from "../drizzle/schema";
import * as db from "./db";
import {
  countTestingRecords,
  fetchMetrcInventory,
  fetchMetrcSalesCount,
  fetchMetrcTestingResults,
  testMetrcConnection,
} from "./metrc";
import { emailDeliveryReady, sendComplianceAlert } from "./notifications";
import { detectDiscrepancies, getAuditRisk } from "./reconciliation";

export async function testConnectionForFacility(facilityId: number) {
  const connection = await db.getMetrcConnection(facilityId);
  if (!connection)
    throw new Error(
      "Save Metrc connection details before testing the connection."
    );
  try {
    await testMetrcConnection(connection);
    await db.setConnectionStatus(facilityId, "connected", { tested: true });
    return { success: true };
  } catch (error) {
    await db.setConnectionStatus(facilityId, "error", { tested: true });
    throw error;
  }
}

export async function reconcileFacility(
  facilityId: number,
  hasRecentSale = false
) {
  const [inventory, logState] = await Promise.all([
    db.listInventory(facilityId),
    db.latestLogsByPackage(facilityId),
  ]);
  const detected: Array<{
    id: number;
    severity: "critical" | "high" | "medium";
    isNew: boolean;
  }> = [];
  const findings = detectDiscrepancies(
    inventory.map(item => ({
      id: item.id,
      metrcPackageId: item.metrcPackageId,
      productName: item.productName,
      sku: item.sku,
      quantity: item.quantity,
      testingStatus: item.testingStatus,
    })),
    logState.latestCounts,
    logState.recentDamage,
    hasRecentSale
  );
  const findingPackages = new Set(
    findings.map(finding => finding.product.metrcPackageId)
  );
  for (const finding of findings) {
    if (!finding.result.severity) continue;
    detected.push(
      await db.upsertDiscrepancy({
        facilityId,
        inventorySnapshotId: finding.product.id,
        metrcPackageId: finding.product.metrcPackageId,
        productName: finding.product.productName,
        sku: finding.product.sku,
        metrcQuantity: Number(finding.product.quantity),
        physicalQuantity: finding.physicalQuantity,
        varianceQuantity: finding.result.varianceQuantity,
        variancePercent: finding.result.variancePercent,
        severity: finding.result.severity,
        likelyCause: finding.result.likelyCause,
      })
    );
  }
  for (const item of inventory)
    if (!findingPackages.has(item.metrcPackageId))
      await db.resolveClearedDiscrepancy(facilityId, item.metrcPackageId);
  return detected;
}

async function queueNotifications(
  facilityId: number,
  newIssues: Awaited<ReturnType<typeof reconcileFacility>>,
  riskChangedToRed: boolean
) {
  const facility = await db.getFacility(facilityId);
  const dashboard = await db.getDashboardData(facilityId);
  const risk = getAuditRisk(dashboard.severities);
  for (const issue of newIssues.filter(
    item =>
      item.isNew && (item.severity === "critical" || item.severity === "high")
  )) {
    const type =
      issue.severity === "critical"
        ? "critical_discrepancy"
        : "high_discrepancy";
    const detail = `${issue.severity === "critical" ? "Critical" : "High"} discrepancy detected after reconciliation.`;
    const eventId = await db.createNotification({
      facilityId,
      discrepancyId: issue.id,
      type,
      recipient: facility?.complianceManagerEmail ?? null,
      detail,
      status: emailDeliveryReady(facility?.complianceManagerEmail ?? null)
        ? "queued"
        : "suppressed",
    });
    try {
      const result = await sendComplianceAlert({
        recipient: facility?.complianceManagerEmail ?? null,
        subject: `MetrcMatch: ${issue.severity} discrepancy detected`,
        detail,
      });
      if (result.delivered) await db.updateNotificationStatus(eventId, "sent");
    } catch {
      await db.updateNotificationStatus(eventId, "failed");
    }
  }
  if (risk.level === "red" && riskChangedToRed) {
    const detail =
      "Facility audit-risk status changed to red after reconciliation.";
    const eventId = await db.createNotification({
      facilityId,
      type: "audit_risk_red",
      recipient: facility?.complianceManagerEmail ?? null,
      detail,
      status: emailDeliveryReady(facility?.complianceManagerEmail ?? null)
        ? "queued"
        : "suppressed",
    });
    try {
      const result = await sendComplianceAlert({
        recipient: facility?.complianceManagerEmail ?? null,
        subject: "MetrcMatch: facility audit risk is red",
        detail,
      });
      if (result.delivered) await db.updateNotificationStatus(eventId, "sent");
    } catch {
      await db.updateNotificationStatus(eventId, "failed");
    }
  }
  return dashboard;
}

export async function runMetrcSync(
  facilityId: number,
  trigger: "manual" | "scheduled"
) {
  const connection = await db.getMetrcConnection(facilityId);
  if (!connection)
    throw new Error("No Metrc connection is configured for this facility.");
  const running = await db.getRunningSync(facilityId);
  if (running)
    return {
      inventoryItems: 0,
      salesRecords: 0,
      discrepancies: 0,
      skipped: "already_running" as const,
    };
  const syncId = await db.createSync(facilityId, trigger);
  try {
    const before = await db.getDashboardData(facilityId);
    const priorRisk = getAuditRisk(before.severities);
    const inventory = await fetchMetrcInventory(
      connection as MetrcConnection,
      connection.lastSyncedAt
    );
    const [salesCount, testingResults] = await Promise.all([
      fetchMetrcSalesCount(connection as MetrcConnection),
      fetchMetrcTestingResults(
        connection as MetrcConnection,
        connection.lastSyncedAt
      ),
    ]);
    const testingCount =
      testingResults.length || countTestingRecords(inventory);
    await db.upsertInventorySnapshots(facilityId, inventory);
    await db.upsertMetrcTestResults(facilityId, testingResults);
    const newIssues = await reconcileFacility(facilityId, salesCount > 0);
    await db.setConnectionStatus(facilityId, "connected", { synced: true });
    await db.finishSync(syncId, {
      status: "success",
      inventoryItems: inventory.length,
      salesRecords: salesCount,
      testRecords: testingCount,
    });
    const after = await db.getDashboardData(facilityId);
    await queueNotifications(
      facilityId,
      newIssues,
      priorRisk.level !== "red" &&
        getAuditRisk(after.severities).level === "red"
    );
    return {
      inventoryItems: inventory.length,
      salesRecords: salesCount,
      testRecords: testingCount,
      discrepancies: newIssues.length,
      skipped: false as const,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Metrc synchronization failed.";
    await db.setConnectionStatus(facilityId, "error");
    await db.finishSync(syncId, { status: "failed", errorSummary: message });
    throw new Error(message);
  }
}
