import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  ensureFacilityForUser: vi.fn(),
}));

vi.mock("./_core/sdk", () => ({
  sdk: { authenticateRequest: mocks.authenticateRequest },
}));
vi.mock("./db", () => ({ ensureFacilityForUser: mocks.ensureFacilityForUser }));

import { ApiError, requireFacilityContext } from "./http";

describe("requireFacilityContext", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the authenticated user and only that user’s facility context", async () => {
    mocks.authenticateRequest.mockResolvedValue({
      id: 17,
      isCron: false,
      name: "Manager",
    });
    mocks.ensureFacilityForUser.mockResolvedValue({
      id: 22,
      name: "Oregon Facility",
    });

    await expect(
      requireFacilityContext({} as never, "Interactive session required.")
    ).resolves.toEqual({
      user: { id: 17, isCron: false, name: "Manager" },
      facility: { id: 22, name: "Oregon Facility" },
    });
    expect(mocks.ensureFacilityForUser).toHaveBeenCalledWith(17);
  });

  it("rejects cron sessions before resolving a facility", async () => {
    mocks.authenticateRequest.mockResolvedValue({ id: 17, isCron: true });

    await expect(
      requireFacilityContext({} as never, "Interactive session required.")
    ).rejects.toEqual(
      expect.objectContaining<ApiError>({
        status: 403,
        code: "CRON_SESSION_FORBIDDEN",
      })
    );
    expect(mocks.ensureFacilityForUser).not.toHaveBeenCalled();
  });

  it("propagates authentication failures for standardized route mapping", async () => {
    mocks.authenticateRequest.mockRejectedValue(
      new Error("session is invalid")
    );

    await expect(
      requireFacilityContext({} as never, "Interactive session required.")
    ).rejects.toThrow("session is invalid");
    expect(mocks.ensureFacilityForUser).not.toHaveBeenCalled();
  });
});
