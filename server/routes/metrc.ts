import type { Express } from "express";
import { sdk } from "../_core/sdk";
import * as db from "../db";
import { runMetrcSync } from "../services";

export function registerMetrcRoutes(app: Express) {
  app.post("/api/metrc/sync", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (user.isCron) return res.status(403).json({ error: "Scheduled sessions must use the scheduled sync route." });
      const facility = await db.ensureFacilityForUser(user.id);
      const result = await runMetrcSync(facility.id, "manual");
      return res.json({ success: true, facilityId: facility.id, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Metrc synchronization failed.";
      if (/session|auth|user/i.test(message)) return res.status(401).json({ error: "Authentication required." });
      if (/connection is configured|credentials/i.test(message)) return res.status(409).json({ error: message });
      console.error("[Metrc] REST sync failed", error);
      return res.status(502).json({ error: "Metrc synchronization failed.", detail: message });
    }
  });
}
