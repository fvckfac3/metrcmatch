import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getMetrcConnection: vi.fn(),
  getRunningSync: vi.fn(),
  createSync: vi.fn(),
}));

vi.mock("./db", () => ({
  getMetrcConnection: mocks.getMetrcConnection,
  getRunningSync: mocks.getRunningSync,
  createSync: mocks.createSync,
}));
vi.mock("./metrc", () => ({
  countTestingRecords: vi.fn(),
  fetchMetrcInventory: vi.fn(),
  fetchMetrcSalesCount: vi.fn(),
  fetchMetrcTestingResults: vi.fn(),
  testMetrcConnection: vi.fn(),
}));
vi.mock("./notifications", () => ({ emailDeliveryReady: vi.fn(), sendComplianceAlert: vi.fn() }));
vi.mock("./reconciliation", () => ({ calculateReconciliation: vi.fn(), getAuditRisk: vi.fn() }));

import { runMetrcSync } from "./services";

describe("runMetrcSync idempotency", () => {
  beforeEach(() => vi.clearAllMocks());

  it("skips an overlapping sync for the same facility", async () => {
    mocks.getMetrcConnection.mockResolvedValue({ id: 7, facilityId: 42 });
    mocks.getRunningSync.mockResolvedValue({ id: 99, facilityId: 42, status: "running" });
    await expect(runMetrcSync(42, "scheduled")).resolves.toEqual({
      inventoryItems: 0,
      salesRecords: 0,
      discrepancies: 0,
      skipped: "already_running",
    });
    expect(mocks.createSync).not.toHaveBeenCalled();
  });
});
