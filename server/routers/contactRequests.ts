import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { ownerProcedure, router } from "../_core/trpc";

const requestStatus = z.enum(["new", "in_review", "closed"]);

export const contactRequestsRouter = router({
  list: ownerProcedure
    .input(z.object({ status: requestStatus.optional() }).optional())
    .query(({ input }) => db.listContactRequests(input?.status)),
  updateStatus: ownerProcedure
    .input(z.object({ id: z.number().int().positive(), status: requestStatus }))
    .mutation(async ({ input }) => {
      const request = await db.updateContactRequestStatus(
        input.id,
        input.status
      );
      if (!request)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact request not found.",
        });
      return request;
    }),
  updateDemoFlag: ownerProcedure
    .input(z.object({ id: z.number().int().positive(), isDemo: z.boolean() }))
    .mutation(async ({ input }) => {
      const request = await db.updateContactRequestDemo(input.id, input.isDemo);
      if (!request)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact request not found.",
        });
      return request;
    }),
  resetDemoData: ownerProcedure
    .input(z.object({ confirmation: z.literal("RESET DEMO DATA") }))
    .mutation(async () => ({ cleared: await db.clearDemoContactRequests() })),
});
