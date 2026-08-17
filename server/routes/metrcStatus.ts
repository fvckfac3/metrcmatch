import type { Express } from "express";
import { sdk } from "../_core/sdk";
import * as db from "../db";
import { getAuditRisk } from "../reconciliation";

export function registerMetrcStatusRoutes(app: Express) {
  app.get("/api/metrc/status", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (user.isCron) return res.status(403).json({ error: "Scheduled sessions cannot read dashboard status." });
      const facility = await db.ensureFacilityForUser(user.id);
      const dashboard = await db.getDashboardData(facility.id);
      return res.json({
        facilityId: facility.id,
        connection: dashboard.connection,
        products: dashboard.products,
        reconciledThisWeek: dashboard.reconciledThisWeek,
        severities: dashboard.severities,
        discrepancies: dashboard.discrepancies,
        trend: dashboard.trend,
        auditRisk: getAuditRisk(dashboard.severities),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to read Metrc status.";
      if (/session|auth|user/i.test(message)) return res.status(401).json({ error: "Authentication required." });
      console.error("[Metrc] REST status failed", error);
      return res.status(500).json({ error: "Unable to read Metrc status." });
    }
  });
}
