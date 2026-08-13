import { describe, expect, it, vi } from "vitest";

vi.mock("../server/db", () => ({
  listTesterFeedback: vi.fn(async () => [{
    id: 7,
    category: "idea",
    message: "A tester feedback sample.",
    pageUrl: "/workouts",
    createdAt: new Date("2026-08-13T12:00:00.000Z"),
  }]),
}));

import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

function contextFor(role: "user" | "admin"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: `${role}-tester`,
      email: `${role}@example.com`,
      name: role,
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("tester feedback review access", () => {
  it("denies the feedback list to non-admin accounts", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.testerFeedback.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns the beta feedback list to an administrator", async () => {
    const caller = appRouter.createCaller(contextFor("admin"));
    await expect(caller.testerFeedback.list()).resolves.toMatchObject([{ id: 7, category: "idea" }]);
  });
});
