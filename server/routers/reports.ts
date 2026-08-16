import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const reportsRouter = router({
  generate: protectedProcedure.input(z.object({ startDate: z.coerce.date(), endDate: z.coerce.date() }).refine(value => value.endDate >= value.startDate, { message: "End date must fall after start date." })).mutation(async ({ ctx, input }) => {
    const facility = await db.ensureFacilityForUser(ctx.user.id);
    const reportId = await db.createReport(facility.id, ctx.user, input.startDate, input.endDate);
    return { reportId };
  }),
});
