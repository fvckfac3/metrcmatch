import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerAuthRoutes } from "./routes/auth";
import { registerMetrcRoutes } from "./routes/metrc";

const authMocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  ensureFacilityForUser: vi.fn(),
  runMetrcSync: vi.fn(),
}));

vi.mock("./_core/sdk", () => ({
  sdk: {
    authenticateRequest: authMocks.authenticateRequest,
    signSession: vi.fn(),
  },
}));
vi.mock("./db", () => ({
  getUserByEmail: vi.fn(),
  createLocalUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  upsertUser: vi.fn(),
  ensureFacilityForUser: authMocks.ensureFacilityForUser,
}));
vi.mock("./services", () => ({ runMetrcSync: authMocks.runMetrcSync }));

const activeFacility = {
  id: 44,
  subscriptionStatus: "active",
  trialEndsAt: null,
};

describe("REST route contracts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects invalid signup input before touching the database", async () => {
    const app = express();
    app.use(express.json());
    registerAuthRoutes(app);
    const response = await request(app)
      .post("/api/auth/signup")
      .send({ email: "not-an-email", password: "short", name: "A" });
    expect(response.status).toBe(400);
    expect(response.body.error).toContain("valid email");
  });

  it("rejects incomplete login input", async () => {
    const app = express();
    app.use(express.json());
    registerAuthRoutes(app);
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "manager@example.com" });
    expect(response.status).toBe(400);
    expect(response.body.error).toContain("required");
  });

  it("returns a configuration error when Metrc credentials are missing", async () => {
    authMocks.authenticateRequest.mockResolvedValue({
      id: 12,
      openId: "local:manager@example.com",
      isCron: false,
    });
    authMocks.ensureFacilityForUser.mockResolvedValue(activeFacility);
    authMocks.runMetrcSync.mockRejectedValue(
      new Error("No Metrc connection is configured for this facility.")
    );
    const app = express();
    app.use(express.json());
    registerMetrcRoutes(app);
    const response = await request(app).post("/api/metrc/sync");
    expect(response.status).toBe(409);
    expect(response.body.error).toContain("No Metrc connection");
  });

  it("delegates an entitled Metrc sync to the facility-scoped service", async () => {
    authMocks.authenticateRequest.mockResolvedValue({
      id: 12,
      openId: "local:manager@example.com",
      isCron: false,
    });
    authMocks.ensureFacilityForUser.mockResolvedValue(activeFacility);
    authMocks.runMetrcSync.mockResolvedValue({
      inventoryItems: 3,
      salesRecords: 2,
      discrepancies: 1,
    });
    const app = express();
    app.use(express.json());
    registerMetrcRoutes(app);
    const response = await request(app).post("/api/metrc/sync");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      facilityId: 44,
      inventoryItems: 3,
    });
    expect(authMocks.runMetrcSync).toHaveBeenCalledWith(44, "manual");
  });

  it("blocks an inactive facility before it can start a Metrc sync", async () => {
    authMocks.authenticateRequest.mockResolvedValue({
      id: 12,
      openId: "local:manager@example.com",
      isCron: false,
    });
    authMocks.ensureFacilityForUser.mockResolvedValue({
      id: 44,
      subscriptionStatus: "inactive",
      trialEndsAt: null,
    });
    const app = express();
    app.use(express.json());
    registerMetrcRoutes(app);

    const response = await request(app).post("/api/metrc/sync");

    expect(response.status).toBe(402);
    expect(response.body.code).toBe("SUBSCRIPTION_REQUIRED");
    expect(authMocks.runMetrcSync).not.toHaveBeenCalled();
  });
});
