import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createContactRequest: vi.fn() }));

vi.mock("./db", () => ({ createContactRequest: mocks.createContactRequest }));

import { parseContactRequest, registerContactRoutes } from "./routes/contact";

const validPrivacyRequest = {
  requestType: "privacy",
  name: "Jordan Smith",
  email: "Jordan@example.com",
  subject: "Account information request",
  message:
    "Please provide the personal information associated with my account.",
  consent: true,
};

describe("public contact requests", () => {
  beforeEach(() => vi.clearAllMocks());

  it("normalizes a valid privacy request", () => {
    expect(parseContactRequest(validPrivacyRequest)).toMatchObject({
      requestType: "privacy",
      email: "jordan@example.com",
      subject: "Account information request",
    });
  });

  it("rejects incomplete general inquiries before persistence", async () => {
    const app = express();
    app.use(express.json());
    registerContactRoutes(app);

    const response = await request(app)
      .post("/api/contact")
      .send({
        ...validPrivacyRequest,
        requestType: "general",
        subject: "",
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION");
    expect(mocks.createContactRequest).not.toHaveBeenCalled();
  });

  it("ignores honeypot submissions without persisting them", async () => {
    const app = express();
    app.use(express.json());
    registerContactRoutes(app);

    const response = await request(app)
      .post("/api/contact")
      .send({ ...validPrivacyRequest, website: "spam.example" });

    expect(response.status).toBe(204);
    expect(mocks.createContactRequest).not.toHaveBeenCalled();
  });

  it("persists a valid request and returns a receipt", async () => {
    mocks.createContactRequest.mockResolvedValue(41);
    const app = express();
    app.use(express.json());
    registerContactRoutes(app);

    const response = await request(app)
      .post("/api/contact")
      .send(validPrivacyRequest);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ received: true, id: 41 });
    expect(mocks.createContactRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        requestType: "privacy",
        email: "jordan@example.com",
      })
    );
  });
});
