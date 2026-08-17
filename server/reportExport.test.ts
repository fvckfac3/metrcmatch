import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerReportExportRoutes } from "./reportExport";

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  ensureFacilityForUser: vi.fn(),
  createReport: vi.fn(),
  getReportData: vi.fn(),
}));
vi.mock("./_core/sdk", () => ({
  sdk: { authenticateRequest: mocks.authenticateRequest },
}));
vi.mock("./db", () => ({
  ensureFacilityForUser: mocks.ensureFacilityForUser,
  createReport: mocks.createReport,
  getReportData: mocks.getReportData,
}));

const reportData = {
  facility: { name: "Oregon Facility", licenseNumber: "OLCC-123" },
  report: {
    id: 7,
    startDate: new Date("2026-08-01T00:00:00Z"),
    endDate: new Date("2026-08-07T23:59:59Z"),
    preparedByName: "Manager",
    totalItemsReconciled: 100,
    discrepanciesFound: 3,
    discrepanciesResolved: 1,
    outstandingDiscrepancies: 2,
    criticalCount: 1,
    highCount: 1,
    mediumCount: 1,
    createdAt: new Date("2026-08-08T00:00:00Z"),
  },
  lines: [
    {
      productName: "Flower",
      sku: "SKU-1",
      metrcQuantity: "100",
      physicalQuantity: "94",
      varianceQuantity: "-6",
      variancePercent: "6",
      severity: "medium",
      likelyCause: "Recent sale",
      status: "investigating",
      resolutionNotes: null,
      detectedAt: new Date("2026-08-03T00:00:00Z"),
    },
  ],
};

describe("GET /api/reports/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authenticateRequest.mockResolvedValue({
      id: 9,
      name: "Manager",
      isCron: false,
    });
    mocks.ensureFacilityForUser.mockResolvedValue({
      id: 44,
      subscriptionStatus: "active",
      trialEndsAt: null,
    });
    mocks.createReport.mockResolvedValue(7);
    mocks.getReportData.mockResolvedValue(reportData);
  });

  it("rejects missing or malformed report query parameters", async () => {
    const app = express();
    registerReportExportRoutes(app);
    const response = await request(app).get(
      "/api/reports/generate?format=docx"
    );
    expect(response.status).toBe(400);
    expect(mocks.createReport).not.toHaveBeenCalled();
  });

  it("returns a CSV containing summary and line-item fields", async () => {
    const app = express();
    registerReportExportRoutes(app);
    const response = await request(app).get(
      "/api/reports/generate?start_date=2026-08-01&end_date=2026-08-07&format=csv"
    );
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/csv");
    expect(response.text).toContain("Discrepancies found,3");
    expect(response.text).toContain("Critical,1");
    expect(response.text).toContain("Flower");
    expect(mocks.createReport).toHaveBeenCalledWith(
      44,
      expect.objectContaining({ id: 9 }),
      new Date("2026-08-01T00:00:00.000Z"),
      new Date("2026-08-07T23:59:59.999Z")
    );
  });

  it("returns a PDF attachment for the same date range", async () => {
    const app = express();
    registerReportExportRoutes(app);
    const response = await request(app).get(
      "/api/reports/generate?start_date=2026-08-01&end_date=2026-08-07&format=pdf"
    );
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/pdf");
    expect(response.headers["content-disposition"]).toContain(
      "metrcmatch-reconciliation-2026-08-01-2026-08-07.pdf"
    );
    expect(response.body).toBeInstanceOf(Buffer);
    expect(response.body.subarray(0, 4).toString()).toBe("%PDF");
  });
});
