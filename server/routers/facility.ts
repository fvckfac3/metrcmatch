import { z } from "zod";
import * as db from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const facilityRouter = router({
  current: protectedProcedure.query(({ ctx }) => db.ensureFacilityForUser(ctx.user.id)),
  save: protectedProcedure.input(z.object({
    name: z.string().trim().min(2).max(255),
    licenseNumber: z.string().trim().max(100).optional().nullable(),
    address: z.string().trim().max(500).optional().nullable(),
    timezone: z.string().trim().min(1).max(64),
    complianceManagerEmail: z.string().trim().email().max(320).optional().nullable(),
    onboardingComplete: z.boolean(),
  })).mutation(({ ctx, input }) => db.updateFacility(ctx.user.id, input)),
});
