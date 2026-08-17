import type { Express } from "express";
import * as db from "../db";
import { requireFacilityContext, sendRouteError } from "../http";
import { getAuditRisk } from "../reconciliation";

export function registerMetrcStatusRoutes(app: Express) {
  app.get("/api/metrc/status", async (req, res) => {
    try {
      const { facility } = await requireFacilityContext(
        req,
        "Scheduled sessions cannot read dashboard status."
      );
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
      return sendRouteError(res, error, {
        scope: "Metrc status",
        fallback: "Unable to read Metrc status.",
      });
    }
  });
}
