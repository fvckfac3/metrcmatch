import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerDiscrepancyRoutes } from "./routes/discrepancies";

const mocks = vi.hoisted(() => ({ authenticateRequest: vi.fn(), ensureFacilityForUser: vi.fn(), listDiscrepancies: vi.fn() }));
vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));
vi.mock("./db", () => ({ ensureFacilityForUser: mocks.ensureFacilityForUser, listDiscrepancies: mocks.listDiscrepancies }));

describe("GET /api/discrepancies/list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authenticateRequest.mockResolvedValue({ id: 9, openId: "local:manager@example.com", isCron: false });
    mocks.ensureFacilityForUser.mockResolvedValue({ id: 44 });
    mocks.listDiscrepancies.mockResolvedValue([{ id: 1, severity: "high", status: "investigating" }]);
  });

  it("lists only the authenticated user facility’s discrepancies", async () => {
    const app = express(); registerDiscrepancyRoutes(app);
    const response = await request(app).get("/api/discrepancies/list?severity=high&status=investigating");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ facilityId: 44, count: 1 });
    expect(mocks.listDiscrepancies).toHaveBeenCalledWith(44, { severity: "high", status: "investigating" });
  });

  it("rejects unsupported filters", async () => {
    const app = express(); registerDiscrepancyRoutes(app);
    const response = await request(app).get("/api/discrepancies/list?severity=urgent");
    expect(response.status).toBe(400);
    expect(mocks.listDiscrepancies).not.toHaveBeenCalled();
  });
});
