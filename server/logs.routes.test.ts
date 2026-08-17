import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerLogRoutes } from "./routes/logs";

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  ensureFacilityForUser: vi.fn(),
  getInventoryByPackage: vi.fn(),
  createPhysicalLog: vi.fn(),
  reconcileFacility: vi.fn(),
}));

vi.mock("./_core/sdk", () => ({
  sdk: { authenticateRequest: mocks.authenticateRequest },
}));
vi.mock("./db", () => ({
  ensureFacilityForUser: mocks.ensureFacilityForUser,
  getInventoryByPackage: mocks.getInventoryByPackage,
  createPhysicalLog: mocks.createPhysicalLog,
}));
vi.mock("./services", () => ({ reconcileFacility: mocks.reconcileFacility }));

describe("POST /api/logs/create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authenticateRequest.mockResolvedValue({
      id: 9,
      openId: "local:staff@example.com",
      isCron: false,
    });
    mocks.ensureFacilityForUser.mockResolvedValue({ id: 44 });
    mocks.getInventoryByPackage.mockResolvedValue({
      id: 5,
      metrcPackageId: "pkg-1",
      productName: "Synced product",
      sku: "sku-1",
      testingStatus: "Passed",
    });
  });

  it("rejects invalid quantity before persistence", async () => {
    const app = express();
    app.use(express.json());
    registerLogRoutes(app);
    const response = await request(app).post("/api/logs/create").send({
      type: "count",
      metrcPackageId: "pkg-1",
      quantity: -1,
      location: "Sales floor",
    });
    expect(response.status).toBe(400);
    expect(mocks.createPhysicalLog).not.toHaveBeenCalled();
  });

  it("persists a count, refreshes reconciliation, and returns a timestamp", async () => {
    const app = express();
    app.use(express.json());
    registerLogRoutes(app);
    const response = await request(app).post("/api/logs/create").send({
      type: "count",
      metrcPackageId: "pkg-1",
      quantity: 12,
      location: "Sales floor",
    });
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ success: true, mismatch: false });
    expect(response.body.timestamp).toEqual(expect.any(String));
    expect(mocks.createPhysicalLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "count",
        quantity: 12,
        location: "Sales floor",
        facilityId: 44,
        createdByUserId: 9,
      })
    );
    expect(mocks.reconcileFacility).toHaveBeenCalledWith(44);
  });

  it("returns a mismatch flag for a lab result that differs from Metrc", async () => {
    const app = express();
    app.use(express.json());
    registerLogRoutes(app);
    const response = await request(app).post("/api/logs/create").send({
      type: "test_result",
      metrcPackageId: "pkg-1",
      testStatus: "failed",
      receivedAt: "2026-08-17T12:00:00.000Z",
    });
    expect(response.status).toBe(201);
    expect(response.body.mismatch).toBe(true);
    expect(mocks.createPhysicalLog).toHaveBeenCalledWith(
      expect.objectContaining({ type: "test_result", testStatus: "failed" })
    );
  });
});
