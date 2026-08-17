import type { Express } from "express";
import { z } from "zod";
import * as db from "../db";
import { requireFacilityContext, sendRouteError } from "../http";

const listQuerySchema = z.object({
  status: z
    .enum(["investigating", "resolved", "awaiting_lab", "other"])
    .optional(),
  severity: z.enum(["critical", "high", "medium"]).optional(),
});

export function registerDiscrepancyRoutes(app: Express) {
  app.get("/api/discrepancies/list", async (req, res) => {
    try {
      const { facility } = await requireFacilityContext(
        req,
        "Scheduled sessions cannot list dashboard discrepancies."
      );
      const filters = listQuerySchema.parse({
        status: req.query.status,
        severity: req.query.severity,
      });
      const discrepancies = await db.listDiscrepancies(facility.id, filters);
      return res.json({
        facilityId: facility.id,
        count: discrepancies.length,
        discrepancies,
      });
    } catch (error) {
      return sendRouteError(res, error, {
        scope: "Discrepancy list",
        fallback: "Unable to list discrepancies.",
        validationMessage: "Invalid discrepancy filters.",
      });
    }
  });
}
