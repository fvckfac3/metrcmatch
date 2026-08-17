import type { Express } from "express";
import { z } from "zod";
import { sdk } from "../_core/sdk";
import * as db from "../db";

const listQuerySchema = z.object({
  status: z.enum(["investigating", "resolved", "awaiting_lab", "other"]).optional(),
  severity: z.enum(["critical", "high", "medium"]).optional(),
});

export function registerDiscrepancyRoutes(app: Express) {
  app.get("/api/discrepancies/list", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (user.isCron) return res.status(403).json({ error: "Scheduled sessions cannot list dashboard discrepancies." });
      const filters = listQuerySchema.parse({ status: req.query.status, severity: req.query.severity });
      const facility = await db.ensureFacilityForUser(user.id);
      const discrepancies = await db.listDiscrepancies(facility.id, filters);
      return res.json({ facilityId: facility.id, count: discrepancies.length, discrepancies });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") return res.status(400).json({ error: "Invalid discrepancy filters." });
      const message = error instanceof Error ? error.message : "Unable to list discrepancies.";
      if (/session|auth|user/i.test(message)) return res.status(401).json({ error: "Authentication required." });
      console.error("[Discrepancies] REST list failed", error);
      return res.status(500).json({ error: "Unable to list discrepancies." });
    }
  });
}
