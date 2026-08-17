import { describe, expect, it } from "vitest";
import {
  calculateReconciliation,
  detectDiscrepancies,
  getAuditRisk,
} from "./reconciliation";

describe("calculateReconciliation", () => {
  it("flags a variance greater than five units as medium when percentage is at most ten", () => {
    expect(
      calculateReconciliation({
        metrcQuantity: 100,
        physicalQuantity: 94,
        testingStatus: "Passed",
        hasRecentDamage: false,
      })
    ).toMatchObject({
      requiresAttention: true,
      varianceQuantity: -6,
      variancePercent: 6,
      severity: "medium",
    });
  });

  it("uses high and critical severity boundaries exactly as specified", () => {
    expect(
      calculateReconciliation({
        metrcQuantity: 100,
        physicalQuantity: 88,
        testingStatus: "Passed",
        hasRecentDamage: false,
      }).severity
    ).toBe("high");
    expect(
      calculateReconciliation({
        metrcQuantity: 100,
        physicalQuantity: 79,
        testingStatus: "Passed",
        hasRecentDamage: false,
      }).severity
    ).toBe("critical");
  });

  it("identifies the no-count condition without inventing a physical quantity", () => {
    expect(
      calculateReconciliation({
        metrcQuantity: 12,
        physicalQuantity: null,
        testingStatus: "Pending",
        hasRecentDamage: false,
      })
    ).toMatchObject({
      severity: "medium",
      likelyCause: "No recent physical count",
    });
  });
});

describe("detectDiscrepancies", () => {
  const products = [
    {
      id: 1,
      metrcPackageId: "pkg-1",
      productName: "Flower",
      sku: "flower",
      quantity: 100,
      testingStatus: "Passed",
    },
  ];

  it("compares the latest physical count and returns the persisted-ready finding", () => {
    const findings = detectDiscrepancies(
      products,
      new Map([["pkg-1", { quantity: 94 }]]),
      new Set()
    );
    expect(findings[0]).toMatchObject({
      product: products[0],
      physicalQuantity: 94,
      result: { varianceQuantity: -6, variancePercent: 6, severity: "medium" },
    });
  });

  it("suggests testing delay, damage logged, recent sale, and no count", () => {
    expect(
      calculateReconciliation({
        metrcQuantity: 100,
        physicalQuantity: 90,
        testingStatus: "Pending",
        hasRecentDamage: false,
      }).likelyCause
    ).toBe("Testing delay");
    expect(
      calculateReconciliation({
        metrcQuantity: 100,
        physicalQuantity: 90,
        testingStatus: "Passed",
        hasRecentDamage: true,
      }).likelyCause
    ).toBe("Damage logged");
    expect(
      calculateReconciliation({
        metrcQuantity: 100,
        physicalQuantity: 90,
        testingStatus: "Passed",
        hasRecentDamage: false,
        hasRecentSale: true,
      }).likelyCause
    ).toBe("Recent sale");
    expect(
      calculateReconciliation({
        metrcQuantity: 100,
        physicalQuantity: null,
        testingStatus: "Passed",
        hasRecentDamage: false,
      }).likelyCause
    ).toBe("No recent physical count");
  });
});

describe("getAuditRisk", () => {
  it("marks the facility red only when a critical issue is open", () => {
    expect(getAuditRisk({ critical: 1, high: 0, medium: 0 }).level).toBe("red");
    expect(getAuditRisk({ critical: 0, high: 1, medium: 0 }).level).toBe(
      "yellow"
    );
    expect(getAuditRisk({ critical: 0, high: 0, medium: 0 }).level).toBe(
      "green"
    );
  });
});
