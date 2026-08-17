import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerMetrcStatusRoutes } from "./routes/metrcStatus";

const mocks = vi.hoisted(() => ({ authenticateRequest: vi.fn(), ensureFacilityForUser: vi.fn(), getDashboardData: vi.fn() }));
vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));
vi.mock("./db", () => ({ ensureFacilityForUser: mocks.ensureFacilityForUser, getDashboardData: mocks.getDashboardData }));

describe("GET /api/metrc/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authenticateRequest.mockResolvedValue({ id: 9, openId: "local:manager@example.com", isCron: false });
    mocks.ensureFacilityForUser.mockResolvedValue({ id: 44 });
    mocks.getDashboardData.mockResolvedValue({ connection: { connectionStatus: "connected", lastSyncedAt: new Date("2026-08-17T10:00:00Z") }, products: 120, reconciledThisWeek: 35, severities: { critical: 1, high: 2, medium: 3 }, discrepancies: [], trend: [] });
  });

  it("returns live facility summary and audit risk", async () => {
    const app = express(); registerMetrcStatusRoutes(app);
    const response = await request(app).get("/api/metrc/status");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ facilityId: 44, products: 120, reconciledThisWeek: 35, auditRisk: { level: "red" } });
    expect(mocks.getDashboardData).toHaveBeenCalledWith(44);
  });
});
