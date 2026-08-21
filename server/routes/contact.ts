import type { Express, Request, Response } from "express";
import * as db from "../db";
import { sendRouteError } from "../http";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const recentRequests = new Map<string, number[]>();

function getString(input: Record<string, unknown>, field: string) {
  const value = input[field];
  return typeof value === "string" ? value.trim() : "";
}

function isRateLimited(req: Request, email: string) {
  const key = `${req.ip}:${email}`;
  const now = Date.now();
  const attempts = (recentRequests.get(key) ?? []).filter(
    timestamp => now - timestamp < WINDOW_MS
  );
  if (attempts.length >= MAX_REQUESTS_PER_WINDOW) {
    recentRequests.set(key, attempts);
    return true;
  }
  attempts.push(now);
  recentRequests.set(key, attempts);
  return false;
}

export function parseContactRequest(body: unknown) {
  const input =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const requestType = getString(input, "requestType");
  const name = getString(input, "name");
  const email = getString(input, "email").toLowerCase();
  const subject = getString(input, "subject");
  const message = getString(input, "message");
  const website = getString(input, "website");
  const consent = input.consent === true;

  if (requestType !== "privacy" && requestType !== "general")
    throw new Error("Choose a request type.");
  if (name.length > 120)
    throw new Error("Name must be 120 characters or fewer.");
  if (!emailPattern.test(email))
    throw new Error("Enter a valid email address.");
  if (subject.length > 255)
    throw new Error("Subject must be 255 characters or fewer.");
  if (requestType === "general" && subject.length < 3)
    throw new Error("Enter a subject for your inquiry.");
  if (message.length < 20 || message.length > 4000)
    throw new Error("Message must be between 20 and 4,000 characters.");
  if (!consent)
    throw new Error("Confirm that we may use your information to respond.");

  return {
    requestType,
    name: name || null,
    email,
    subject: subject || (requestType === "privacy" ? "Privacy request" : null),
    message,
    website,
  } as const;
}

export function registerContactRoutes(app: Express) {
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const request = parseContactRequest(req.body);
      if (request.website) return res.status(204).end();
      if (isRateLimited(req, request.email))
        return res.status(429).json({
          error: "Too many requests. Please wait a few minutes and try again.",
          code: "RATE_LIMITED",
        });
      const id = await db.createContactRequest(request);
      return res.status(201).json({ received: true, id });
    } catch (error) {
      if (error instanceof Error)
        return res
          .status(400)
          .json({ error: error.message, code: "VALIDATION" });
      return sendRouteError(res, error, {
        scope: "Public contact request",
        fallback: "Unable to submit your request. Please try again shortly.",
      });
    }
  });
}
