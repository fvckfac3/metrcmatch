import { describe, expect, it } from "vitest";
import { calculateReconciliation, getAuditRisk } from "./reconciliation";

describe("calculateReconciliation", () => {
  it("flags a variance greater than five units as medium when percentage is at most ten", () => {
    expect(calculateReconciliation({ metrcQuantity: 100, physicalQuantity: 94, testingStatus: "Passed", hasRecentDamage: false })).toMatchObject({ requiresAttention: true, varianceQuantity: -6, variancePercent: 6, severity: "medium" });
  });

  it("uses high and critical severity boundaries exactly as specified", () => {
    expect(calculateReconciliation({ metrcQuantity: 100, physicalQuantity: 88, testingStatus: "Passed", hasRecentDamage: false }).severity).toBe("high");
    expect(calculateReconciliation({ metrcQuantity: 100, physicalQuantity: 79, testingStatus: "Passed", hasRecentDamage: false }).severity).toBe("critical");
  });

  it("identifies the no-count condition without inventing a physical quantity", () => {
    expect(calculateReconciliation({ metrcQuantity: 12, physicalQuantity: null, testingStatus: "Pending", hasRecentDamage: false })).toMatchObject({ severity: "medium", likelyCause: "No recent physical count" });
  });
});

describe("getAuditRisk", () => {
  it("marks the facility red only when a critical issue is open", () => {
    expect(getAuditRisk({ critical: 1, high: 0, medium: 0 }).level).toBe("red");
    expect(getAuditRisk({ critical: 0, high: 1, medium: 0 }).level).toBe("yellow");
    expect(getAuditRisk({ critical: 0, high: 0, medium: 0 }).level).toBe("green");
  });
});
