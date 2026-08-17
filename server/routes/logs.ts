import type { Express } from "express";
import * as db from "../db";
import { requireFacilityContext, sendRouteError } from "../http";
import { createLogSchema } from "../logValidation";
import { reconcileFacility } from "../services";

export function registerLogRoutes(app: Express) {
  app.post("/api/logs/create", async (req, res) => {
    try {
      const { user, facility } = await requireFacilityContext(
        req,
        "Scheduled sessions cannot create physical logs."
      );
      const input = createLogSchema.parse(req.body);
      const inventory = await db.getInventoryByPackage(
        facility.id,
        input.metrcPackageId
      );
      if (!inventory)
        return res.status(422).json({
          error: "Select a product from the current Metrc inventory.",
          code: "INVENTORY_NOT_FOUND",
        });

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
        reason:
          input.type === "damage" || input.type === "discard"
            ? input.reason
            : null,
        testStatus: input.type === "test_result" ? input.testStatus : null,
        receivedAt: input.type === "test_result" ? input.receivedAt : null,
        notes:
          input.type === "damage" || input.type === "discard"
            ? (input.notes ?? null)
            : null,
      });
      await reconcileFacility(facility.id);
      const mismatch =
        input.type === "test_result"
          ? !inventory.testingStatus.toLowerCase().includes(input.testStatus)
          : false;
      return res
        .status(201)
        .json({ success: true, timestamp: new Date().toISOString(), mismatch });
    } catch (error) {
      return sendRouteError(res, error, {
        scope: "Physical log",
        fallback: "Unable to create physical log.",
        validationMessage: "Invalid log input.",
      });
    }
  });
}
