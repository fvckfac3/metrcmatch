import { z } from "zod";

export const logModeSchema = z.enum(["count", "damage", "discard", "test_result"]);
export const packageInputSchema = z.object({ metrcPackageId: z.string().trim().min(1).max(128) });

export const countLogSchema = packageInputSchema.extend({
  type: z.literal("count"),
  quantity: z.coerce.number().finite().min(0),
  location: z.string().trim().min(1).max(255),
});

export const damageLogSchema = packageInputSchema.extend({
  type: z.enum(["damage", "discard"]),
  quantity: z.coerce.number().finite().positive(),
  reason: z.enum(["broken", "expired", "theft", "waste", "other"]),
  notes: z.string().trim().max(2000).optional(),
});

export const testLogSchema = packageInputSchema.extend({
  type: z.literal("test_result"),
  testStatus: z.enum(["passed", "failed"]),
  receivedAt: z.coerce.date(),
});

export const createLogSchema = z.discriminatedUnion("type", [countLogSchema, damageLogSchema, testLogSchema]);
export type CreateLogInput = z.infer<typeof createLogSchema>;
