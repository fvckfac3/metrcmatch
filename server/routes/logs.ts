import type { Express } from "express";
import { sdk } from "../_core/sdk";
import * as db from "../db";
import { reconcileFacility } from "../services";
import { createLogSchema } from "../logValidation";

export function registerLogRoutes(app: Express) {
  app.post("/api/logs/create", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (user.isCron) return res.status(403).json({ error: "Scheduled sessions cannot create physical logs." });
      const input = createLogSchema.parse(req.body);
      const facility = await db.ensureFacilityForUser(user.id);
      const inventory = await db.getInventoryByPackage(facility.id, input.metrcPackageId);
      if (!inventory) return res.status(422).json({ error: "Select a product from the current Metrc inventory." });

      await db.createPhysicalLog({
        facilityId: facility.id,
        createdByUserId: user.id,
        inventorySnapshotId: inventory.id,
        metrcPackageId: inventory.metrcPackageId,
        productName: inventory.productName,
        sku: inventory.sku,
        type: input.type,
        quantity: input.type === "test_result" ? null : input.quantity,
        location: input.type === "count" ? input.location : null,
        reason: input.type === "damage" || input.type === "discard" ? input.reason : null,
        testStatus: input.type === "test_result" ? input.testStatus : null,
        receivedAt: input.type === "test_result" ? input.receivedAt : null,
        notes: input.type === "damage" || input.type === "discard" ? input.notes ?? null : null,
      });
      await reconcileFacility(facility.id);
      const mismatch = input.type === "test_result" ? !inventory.testingStatus.toLowerCase().includes(input.testStatus) : false;
      return res.status(201).json({ success: true, timestamp: new Date().toISOString(), mismatch });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") return res.status(400).json({ error: "Invalid log input.", details: error.message });
      const message = error instanceof Error ? error.message : "Unable to create physical log.";
      if (/session|auth|user/i.test(message)) return res.status(401).json({ error: "Authentication required." });
      console.error("[Logs] REST create failed", error);
      return res.status(500).json({ error: "Unable to create physical log.", detail: message });
    }
  });
}
