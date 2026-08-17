import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError, sendRouteError } from "./http";

function responseMock() {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  };
  response.status.mockReturnValue(response);
  return response;
}

describe("sendRouteError", () => {
  afterEach(() => vi.restoreAllMocks());

  it("preserves explicit API errors with stable status and code", () => {
    const response = responseMock();
    sendRouteError(
      response as never,
      new ApiError(
        403,
        "Interactive session required.",
        "CRON_SESSION_FORBIDDEN"
      ),
      {
        scope: "Test",
        fallback: "Unexpected failure.",
      }
    );
    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith({
      error: "Interactive session required.",
      code: "CRON_SESSION_FORBIDDEN",
    });
  });

  it("maps Zod validation failures to a safe 400 envelope with field details", () => {
    const response = responseMock();
    const parsed = z
      .object({ productId: z.string().min(1) })
      .safeParse({ productId: "" });
    if (parsed.success) throw new Error("Expected validation to fail");
    sendRouteError(response as never, parsed.error, {
      scope: "Test",
      fallback: "Unexpected failure.",
      validationMessage: "Invalid product input.",
    });
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Invalid product input.",
        code: "VALIDATION_ERROR",
        details: expect.any(Object),
      })
    );
  });

  it("does not expose internal error details in generic server responses", () => {
    const response = responseMock();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    sendRouteError(
      response as never,
      new Error("database connection string leaked"),
      {
        scope: "Test",
        fallback: "Request could not be completed.",
      }
    );
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      error: "Request could not be completed.",
      code: "INTERNAL_ERROR",
    });
  });
});
