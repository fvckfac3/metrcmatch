import type { Express } from "express";
import { requireFacilityContext, sendRouteError } from "../http";
import { runMetrcSync } from "../services";

export function registerMetrcRoutes(app: Express) {
  app.post("/api/metrc/sync", async (req, res) => {
    try {
      const { facility } = await requireFacilityContext(
        req,
        "Scheduled sessions must use the scheduled sync route."
      );
      const result = await runMetrcSync(facility.id, "manual");
      return res.json({ success: true, facilityId: facility.id, ...result });
    } catch (error) {
      return sendRouteError(res, error, {
        scope: "Metrc sync",
        fallback: "Metrc synchronization failed.",
        mappings: [
          {
            match: /connection is configured|credentials/i,
            status: 409,
            code: "METRC_NOT_CONFIGURED",
          },
        ],
      });
    }
  });
}
