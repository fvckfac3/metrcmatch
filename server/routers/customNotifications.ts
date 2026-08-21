import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { ownerProcedure, protectedProcedure, router } from "../_core/trpc";

const notificationSeverity = z.enum(["info", "success", "warning", "critical"]);

const notificationFields = {
  title: z.string().trim().min(3).max(140),
  message: z.string().trim().min(3).max(2_000),
  severity: notificationSeverity,
  expiresAt: z.date().nullable().optional(),
};

const notificationUpdateInput = z
  .object({
    id: z.number().int().positive(),
    title: notificationFields.title.optional(),
    message: notificationFields.message.optional(),
    severity: notificationFields.severity.optional(),
    isActive: z.boolean().optional(),
    expiresAt: notificationFields.expiresAt,
  })
  .refine(
    input =>
      input.title !== undefined ||
      input.message !== undefined ||
      input.severity !== undefined ||
      input.isActive !== undefined ||
      input.expiresAt !== undefined,
    "Provide at least one field to update."
  );

export const customNotificationsRouter = router({
  listActive: protectedProcedure.query(({ ctx }) =>
    db.listActiveCustomNotifications(ctx.user.id)
  ),
  dismiss: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await db.dismissCustomNotification(input.id, ctx.user.id);
      return { success: true };
    }),
  listAll: ownerProcedure.query(() => db.listAllCustomNotifications()),
  create: ownerProcedure
    .input(
      z.object({
        title: notificationFields.title,
        message: notificationFields.message,
        severity: notificationFields.severity,
        expiresAt: notificationFields.expiresAt,
      })
    )
    .mutation(({ ctx, input }) =>
      db.createCustomNotification({
        ...input,
        createdByUserId: ctx.user.id,
      })
    ),
  update: ownerProcedure
    .input(notificationUpdateInput)
    .mutation(async ({ input }) => {
      const notification = await db.updateCustomNotification(input.id, {
        title: input.title,
        message: input.message,
        severity: input.severity,
        isActive: input.isActive,
        expiresAt: input.expiresAt,
      });
      if (!notification)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Custom notification not found.",
        });
      return notification;
    }),
  deactivate: ownerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const notification = await db.deactivateCustomNotification(input.id);
      if (!notification)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Custom notification not found.",
        });
      return notification;
    }),
});
