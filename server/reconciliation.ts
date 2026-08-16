export type DiscrepancySeverity = "critical" | "high" | "medium";

export type ReconciliationInput = {
  metrcQuantity: number;
  physicalQuantity: number | null;
  testingStatus: string;
  hasRecentDamage: boolean;
};

export type ReconciliationResult = {
  requiresAttention: boolean;
  varianceQuantity: number;
  variancePercent: number;
  severity: DiscrepancySeverity | null;
  likelyCause: string;
};

export function calculateReconciliation(input: ReconciliationInput): ReconciliationResult {
  if (input.physicalQuantity === null) {
    return {
      requiresAttention: true,
      varianceQuantity: 0,
      variancePercent: 0,
      severity: "medium",
      likelyCause: "No recent physical count",
    };
  }

  const varianceQuantity = Number((input.physicalQuantity - input.metrcQuantity).toFixed(3));
  const variancePercent = input.metrcQuantity === 0
    ? (input.physicalQuantity === 0 ? 0 : 100)
    : Number((Math.abs(varianceQuantity) / Math.abs(input.metrcQuantity) * 100).toFixed(2));
  const requiresAttention = Math.abs(varianceQuantity) > 5 || variancePercent > 5;
  const normalizedTesting = input.testingStatus.toLowerCase();
  const likelyCause = normalizedTesting.includes("pending") || normalizedTesting.includes("not submitted")
    ? "Testing pending"
    : input.hasRecentDamage
      ? "Damage logged but not yet reflected in Metrc"
      : "Recent sale or data-entry timing difference";

  if (!requiresAttention) {
    return { requiresAttention, varianceQuantity, variancePercent, severity: null, likelyCause };
  }

  const severity: DiscrepancySeverity = variancePercent > 20 ? "critical" : variancePercent > 10 ? "high" : "medium";
  return { requiresAttention, varianceQuantity, variancePercent, severity, likelyCause };
}

export function getAuditRisk(counts: { critical: number; high: number; medium: number }) {
  if (counts.critical > 0) {
    return { level: "red" as const, label: "Action required", recommendation: "Escalate critical discrepancies to the compliance manager and verify Metrc reporting immediately." };
  }
  if (counts.high > 0 || counts.medium > 0) {
    return { level: "yellow" as const, label: "Review required", recommendation: "Resolve or document outstanding discrepancies before the next compliance review." };
  }
  return { level: "green" as const, label: "Reconciled", recommendation: "Continue daily reconciliation and timely Metrc reporting for inventory changes." };
}
