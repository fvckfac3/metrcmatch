import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { getAuditRisk } from "../reconciliation";

export const discrepanciesRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          status: z
            .enum(["investigating", "resolved", "awaiting_lab", "other"])
            .optional(),
          severity: z.enum(["critical", "high", "medium"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const facility = await db.ensureFacilityForUser(ctx.user.id);
      return db.listDiscrepancies(facility.id, input);
    }),
  resolve: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        status: z.enum(["investigating", "resolved", "awaiting_lab", "other"]),
        resolutionNotes: z.string().trim().max(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const facility = await db.ensureFacilityForUser(ctx.user.id);
      await db.updateDiscrepancy(facility.id, input.id, input);
      return { success: true };
    }),
  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const facility = await db.ensureFacilityForUser(ctx.user.id);
    const data = await db.getDashboardData(facility.id);
    return { ...data, auditRisk: getAuditRisk(data.severities) };
  }),
});
