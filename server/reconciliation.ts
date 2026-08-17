export type DiscrepancySeverity = "critical" | "high" | "medium";

export type ReconciliationInput = {
  metrcQuantity: number;
  physicalQuantity: number | null;
  testingStatus: string;
  hasRecentDamage: boolean;
  hasRecentSale?: boolean;
};

export type ReconciliationResult = {
  requiresAttention: boolean;
  varianceQuantity: number;
  variancePercent: number;
  severity: DiscrepancySeverity | null;
  likelyCause: string;
};

export function calculateReconciliation(
  input: ReconciliationInput
): ReconciliationResult {
  if (input.physicalQuantity === null) {
    return {
      requiresAttention: true,
      varianceQuantity: 0,
      variancePercent: 0,
      severity: "medium",
      likelyCause: "No recent physical count",
    };
  }

  const varianceQuantity = Number(
    (input.physicalQuantity - input.metrcQuantity).toFixed(3)
  );
  const variancePercent =
    input.metrcQuantity === 0
      ? input.physicalQuantity === 0
        ? 0
        : 100
      : Number(
          (
            (Math.abs(varianceQuantity) / Math.abs(input.metrcQuantity)) *
            100
          ).toFixed(2)
        );
  const requiresAttention =
    Math.abs(varianceQuantity) > 5 || variancePercent > 5;
  const normalizedTesting = input.testingStatus.toLowerCase();
  const likelyCause =
    normalizedTesting.includes("pending") ||
    normalizedTesting.includes("not submitted") ||
    normalizedTesting.includes("awaiting")
      ? "Testing delay"
      : input.hasRecentDamage
        ? "Damage logged"
        : input.hasRecentSale
          ? "Recent sale"
          : "Recent sale or data-entry timing difference";

  if (!requiresAttention) {
    return {
      requiresAttention,
      varianceQuantity,
      variancePercent,
      severity: null,
      likelyCause,
    };
  }

  const severity: DiscrepancySeverity =
    variancePercent > 20
      ? "critical"
      : variancePercent > 10
        ? "high"
        : "medium";
  return {
    requiresAttention,
    varianceQuantity,
    variancePercent,
    severity,
    likelyCause,
  };
}

export type ReconciliationProduct = {
  id: number;
  metrcPackageId: string;
  productName: string;
  sku: string | null;
  quantity: number | string;
  testingStatus: string;
};

export type ReconciliationCount = { quantity: number | string | null };

export function detectDiscrepancies(
  products: ReconciliationProduct[],
  latestCounts: Map<string, ReconciliationCount>,
  recentDamage: Set<string>,
  hasRecentSale = false
) {
  return products
    .map(product => {
      const latestCount = latestCounts.get(product.metrcPackageId);
      const result = calculateReconciliation({
        metrcQuantity: Number(product.quantity),
        physicalQuantity:
          latestCount?.quantity === null || latestCount?.quantity === undefined
            ? null
            : Number(latestCount.quantity),
        testingStatus: product.testingStatus,
        hasRecentDamage: recentDamage.has(product.metrcPackageId),
        hasRecentSale,
      });
      return {
        product,
        result,
        physicalQuantity:
          latestCount?.quantity === null || latestCount?.quantity === undefined
            ? null
            : Number(latestCount.quantity),
      };
    })
    .filter(item => item.result.requiresAttention);
}

export function getAuditRisk(counts: {
  critical: number;
  high: number;
  medium: number;
}) {
  if (counts.critical > 0) {
    return {
      level: "red" as const,
      label: "Action required",
      recommendation:
        "Escalate critical discrepancies to the compliance manager and verify Metrc reporting immediately.",
    };
  }
  if (counts.high > 0 || counts.medium > 0) {
    return {
      level: "yellow" as const,
      label: "Review required",
      recommendation:
        "Resolve or document outstanding discrepancies before the next compliance review.",
    };
  }
  return {
    level: "green" as const,
    label: "Reconciled",
    recommendation:
      "Continue daily reconciliation and timely Metrc reporting for inventory changes.",
  };
}
