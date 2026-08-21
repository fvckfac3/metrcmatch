import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createCustomNotification: vi.fn(),
  deactivateCustomNotification: vi.fn(),
  dismissCustomNotification: vi.fn(),
  listActiveCustomNotifications: vi.fn(),
  listAllCustomNotifications: vi.fn(),
  updateCustomNotification: vi.fn(),
}));

vi.mock("./db", () => mocks);
vi.mock("./_core/env", () => ({ ENV: { ownerOpenId: "owner" } }));

import { customNotificationsRouter } from "./routers/customNotifications";

const ownerContext = {
  user: { id: 1, role: "admin", openId: "owner", name: "Rocky" },
} as never;
const signedInUserContext = {
  user: { id: 2, role: "user", openId: "workspace-user", name: "Casey" },
} as never;
const nonOwnerAdminContext = {
  user: { id: 3, role: "admin", openId: "other-admin", name: "Other admin" },
} as never;
const anonymousContext = {} as never;

describe("custom notification procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows the configured owner to create a notification", async () => {
    mocks.createCustomNotification.mockResolvedValue(12);
    const caller = customNotificationsRouter.createCaller(ownerContext);

    await expect(
      caller.create({
        title: "Scheduled maintenance",
        message: "The workspace will be unavailable for five minutes.",
        severity: "warning",
      })
    ).resolves.toBe(12);

    expect(mocks.createCustomNotification).toHaveBeenCalledWith({
      title: "Scheduled maintenance",
      message: "The workspace will be unavailable for five minutes.",
      severity: "warning",
      expiresAt: undefined,
      createdByUserId: 1,
    });
  });

  it("allows the configured owner to list and deactivate notifications", async () => {
    mocks.listAllCustomNotifications.mockResolvedValue([{ id: 12 }]);
    mocks.deactivateCustomNotification.mockResolvedValue({
      id: 12,
      isActive: false,
    });
    const caller = customNotificationsRouter.createCaller(ownerContext);

    await expect(caller.listAll()).resolves.toEqual([{ id: 12 }]);
    await expect(caller.deactivate({ id: 12 })).resolves.toMatchObject({
      isActive: false,
    });
    expect(mocks.deactivateCustomNotification).toHaveBeenCalledWith(12);
  });

  it("blocks a different administrator from notification management", async () => {
    const caller = customNotificationsRouter.createCaller(nonOwnerAdminContext);

    await expect(caller.listAll()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      caller.create({
        title: "Owner notice",
        message: "Only the configured owner can publish this notice.",
        severity: "info",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.listAllCustomNotifications).not.toHaveBeenCalled();
    expect(mocks.createCustomNotification).not.toHaveBeenCalled();
  });

  it("allows any signed-in workspace user to list active notices and dismiss one", async () => {
    mocks.listActiveCustomNotifications.mockResolvedValue([
      { id: 12, title: "A current notice" },
    ]);
    const caller = customNotificationsRouter.createCaller(signedInUserContext);

    await expect(caller.listActive()).resolves.toEqual([
      { id: 12, title: "A current notice" },
    ]);
    await expect(caller.dismiss({ id: 12 })).resolves.toEqual({
      success: true,
    });
    expect(mocks.listActiveCustomNotifications).toHaveBeenCalledWith(2);
    expect(mocks.dismissCustomNotification).toHaveBeenCalledWith(12, 2);
  });

  it("refreshes the dismissal-filtered active notice list after a user dismisses a notice", async () => {
    let dismissed = false;
    mocks.listActiveCustomNotifications.mockImplementation(async () =>
      dismissed ? [] : [{ id: 12, title: "A dismissible notice" }]
    );
    mocks.dismissCustomNotification.mockImplementation(async () => {
      dismissed = true;
    });
    const caller = customNotificationsRouter.createCaller(signedInUserContext);

    await expect(caller.listActive()).resolves.toEqual([
      { id: 12, title: "A dismissible notice" },
    ]);
    await caller.dismiss({ id: 12 });
    await expect(caller.listActive()).resolves.toEqual([]);
  });

  it("does not allow an anonymous visitor to read or dismiss workspace notices", async () => {
    const caller = customNotificationsRouter.createCaller(anonymousContext);

    await expect(caller.listActive()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    await expect(caller.dismiss({ id: 12 })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(mocks.listActiveCustomNotifications).not.toHaveBeenCalled();
    expect(mocks.dismissCustomNotification).not.toHaveBeenCalled();
  });

  it("rejects updates that do not change a notification field", async () => {
    const caller = customNotificationsRouter.createCaller(ownerContext);

    await expect(caller.update({ id: 12 })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    expect(mocks.updateCustomNotification).not.toHaveBeenCalled();
  });
});
