import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listContactRequests: vi.fn(),
  updateContactRequestStatus: vi.fn(),
}));

vi.mock("./db", () => ({
  listContactRequests: mocks.listContactRequests,
  updateContactRequestStatus: mocks.updateContactRequestStatus,
}));
vi.mock("./_core/env", () => ({ ENV: { ownerOpenId: "owner" } }));

import { contactRequestsRouter } from "./routers/contactRequests";

const adminContext = {
  user: { id: 1, role: "admin", openId: "owner", name: "Rocky" },
} as never;
const nonOwnerAdminContext = {
  user: { id: 2, role: "admin", openId: "other-admin", name: "Other admin" },
} as never;

describe("contact request management procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists privacy and inquiry records for an administrator", async () => {
    mocks.listContactRequests.mockResolvedValue([{ id: 3, status: "new" }]);
    const caller = contactRequestsRouter.createCaller(adminContext);

    await expect(caller.list({ status: "new" })).resolves.toEqual([
      { id: 3, status: "new" },
    ]);
    expect(mocks.listContactRequests).toHaveBeenCalledWith("new");
  });

  it("blocks a non-owner administrator before contact records are read", async () => {
    const caller = contactRequestsRouter.createCaller(nonOwnerAdminContext);

    await expect(caller.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.listContactRequests).not.toHaveBeenCalled();
  });

  it("updates a request status for an administrator", async () => {
    mocks.updateContactRequestStatus.mockResolvedValue({
      id: 3,
      status: "closed",
    });
    const caller = contactRequestsRouter.createCaller(adminContext);

    await expect(
      caller.updateStatus({ id: 3, status: "closed" })
    ).resolves.toMatchObject({ id: 3, status: "closed" });
    expect(mocks.updateContactRequestStatus).toHaveBeenCalledWith(3, "closed");
  });

  it("returns not found when the contact request no longer exists", async () => {
    mocks.updateContactRequestStatus.mockResolvedValue(null);
    const caller = contactRequestsRouter.createCaller(adminContext);

    await expect(
      caller.updateStatus({ id: 999, status: "in_review" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
