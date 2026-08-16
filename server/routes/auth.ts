import type { Express, Request, Response } from "express";
import { compare, hash } from "bcryptjs";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { ENV } from "../_core/env";
import { sdk } from "../_core/sdk";
import * as db from "../db";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizedCredentials(body: unknown) {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";
  return { email, name, password };
}

function publicUser(user: NonNullable<Awaited<ReturnType<typeof db.getUserByOpenId>>>) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

async function issueSession(req: Request, res: Response, user: NonNullable<Awaited<ReturnType<typeof db.getUserByOpenId>>>) {
  const token = await sdk.signSession({ openId: user.openId, appId: ENV.appId, name: user.name ?? user.email ?? "MetrcMatch user" });
  res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: 1000 * 60 * 60 * 24 * 30 });
}

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, name, password } = normalizedCredentials(req.body);
      if (!emailPattern.test(email)) return res.status(400).json({ error: "A valid email address is required." });
      if (name.length < 2 || name.length > 120) return res.status(400).json({ error: "Name must be between 2 and 120 characters." });
      if (password.length < 8 || password.length > 128) return res.status(400).json({ error: "Password must be between 8 and 128 characters." });
      if (await db.getUserByEmail(email)) return res.status(409).json({ error: "An account with this email already exists." });
      const passwordHash = await hash(password, 12);
      const user = await db.createLocalUser({ email, name, passwordHash });
      if (!user) return res.status(500).json({ error: "Account was created but could not be loaded." });
      await issueSession(req, res, user);
      return res.status(201).json({ user: publicUser(user) });
    } catch (error) {
      console.error("[Auth] Signup failed", error);
      return res.status(500).json({ error: "Unable to create account." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = normalizedCredentials(req.body);
      if (!emailPattern.test(email) || password.length === 0) return res.status(400).json({ error: "Email and password are required." });
      const user = await db.getUserByEmail(email);
      if (!user?.passwordHash || !(await compare(password, user.passwordHash))) return res.status(401).json({ error: "Invalid email or password." });
      await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });
      await issueSession(req, res, user);
      return res.json({ user: publicUser(user) });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      return res.status(500).json({ error: "Unable to sign in." });
    }
  });
}
