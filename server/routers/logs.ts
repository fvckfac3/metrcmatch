import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { reconcileFacility } from "../services";

const packageInput = z.object({ metrcPackageId: z.string().min(1).max(128) });

async function productForLog(userId: number, packageId: string) {
  const facility = await db.ensureFacilityForUser(userId);
  const inventory = await db.getInventoryByPackage(facility.id, packageId);
  if (!inventory) throw new Error("Select a product from the current Metrc inventory.");
  return { facility, inventory };
}

export const logsRouter = router({
  products: protectedProcedure.input(z.object({ query: z.string().max(100).optional() }).optional()).query(async ({ ctx, input }) => {
    const facility = await db.ensureFacilityForUser(ctx.user.id);
    const query = input?.query?.trim().toLowerCase();
    const items = await db.listInventory(facility.id);
    return items.filter(item => !query || `${item.productName} ${item.sku ?? ""} ${item.packageLabel ?? ""}`.toLowerCase().includes(query)).slice(0, 30);
  }),
  createCount: protectedProcedure.input(packageInput.extend({ quantity: z.coerce.number().finite().min(0), location: z.string().trim().min(1).max(255) })).mutation(async ({ ctx, input }) => {
    const { facility, inventory } = await productForLog(ctx.user.id, input.metrcPackageId);
    await db.createPhysicalLog({ facilityId: facility.id, createdByUserId: ctx.user.id, inventorySnapshotId: inventory.id, metrcPackageId: inventory.metrcPackageId, productName: inventory.productName, sku: inventory.sku, type: "count", quantity: input.quantity, location: input.location });
    await reconcileFacility(facility.id);
    return { success: true };
  }),
  createDamage: protectedProcedure.input(packageInput.extend({ quantity: z.coerce.number().positive(), reason: z.enum(["broken", "expired", "theft", "waste", "other"]), notes: z.string().trim().max(2000).optional(), type: z.enum(["damage", "discard"]) })).mutation(async ({ ctx, input }) => {
    const { facility, inventory } = await productForLog(ctx.user.id, input.metrcPackageId);
    await db.createPhysicalLog({ facilityId: facility.id, createdByUserId: ctx.user.id, inventorySnapshotId: inventory.id, metrcPackageId: inventory.metrcPackageId, productName: inventory.productName, sku: inventory.sku, type: input.type, quantity: input.quantity, reason: input.reason, notes: input.notes ?? null });
    await reconcileFacility(facility.id);
    return { success: true };
  }),
  createTest: protectedProcedure.input(packageInput.extend({ testStatus: z.enum(["passed", "failed"]), receivedAt: z.coerce.date() })).mutation(async ({ ctx, input }) => {
    const { facility, inventory } = await productForLog(ctx.user.id, input.metrcPackageId);
    await db.createPhysicalLog({ facilityId: facility.id, createdByUserId: ctx.user.id, inventorySnapshotId: inventory.id, metrcPackageId: inventory.metrcPackageId, productName: inventory.productName, sku: inventory.sku, type: "test_result", testStatus: input.testStatus, receivedAt: input.receivedAt });
    return { success: true, mismatch: !inventory.testingStatus.toLowerCase().includes(input.testStatus) };
  }),
  list: protectedProcedure.input(z.object({ type: z.enum(["count", "damage", "discard", "test_result"]).optional(), query: z.string().max(100).optional() }).optional()).query(async ({ ctx, input }) => {
    const facility = await db.ensureFacilityForUser(ctx.user.id);
    return db.listPhysicalLogs(facility.id, input);
  }),
});
