import type { Request, Response } from "express";
import { ZodError } from "zod";
import { sdk } from "./_core/sdk";
import * as db from "./db";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = "REQUEST_FAILED"
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isAuthenticationError(error: unknown) {
  return (
    error instanceof Error && /session|auth|user|token/i.test(error.message)
  );
}

export async function requireFacilityContext(
  req: Request,
  cronMessage: string
) {
  const user = await sdk.authenticateRequest(req);
  if (user.isCron)
    throw new ApiError(403, cronMessage, "CRON_SESSION_FORBIDDEN");
  const facility = await db.ensureFacilityForUser(user.id);
  return { user, facility };
}

export function sendRouteError(
  res: Response,
  error: unknown,
  options: {
    scope: string;
    fallback: string;
    validationMessage?: string;
    mappings?: Array<{
      match: RegExp;
      status: number;
      message?: string;
      code?: string;
    }>;
  }
) {
  if (error instanceof ApiError)
    return res
      .status(error.status)
      .json({ error: error.message, code: error.code });
  if (error instanceof ZodError)
    return res.status(400).json({
      error: options.validationMessage ?? "Invalid request.",
      code: "VALIDATION_ERROR",
      details: error.flatten(),
    });
  if (isAuthenticationError(error))
    return res
      .status(401)
      .json({ error: "Authentication required.", code: "AUTH_REQUIRED" });

  const message = error instanceof Error ? error.message : "";
  const mapped = options.mappings?.find(item => item.match.test(message));
  if (mapped)
    return res.status(mapped.status).json({
      error: mapped.message ?? message,
      code: mapped.code ?? "REQUEST_CONFLICT",
    });

  console.error(`[${options.scope}] Request failed`, error);
  return res
    .status(500)
    .json({ error: options.fallback, code: "INTERNAL_ERROR" });
}
