import { ClientUserSchema } from "../lib/types/user";
import { sanitizeUser } from "../server/util/user";

import { describe, expect, test } from "vitest";

describe("sanitizeUser", () => {
  test("replaces private bank tokens with capability flags", () => {
    const databaseUser = {
      id: "user-id",
      name: "Test User",
      financialConnectionArray: [
        {
          status: "ACTIVE" as const,
          lastSyncSuccessAt: new Date("2026-07-17T00:00:00.000Z"),
        },
      ],
      futurePrivateField: "private",
      myConnectionArray: [
        {
          id: "connection-id",
          name: "Connection",
          futurePrivateField: "private",
        },
      ],
    };
    const user = sanitizeUser(databaseUser);

    expect(user).toEqual({
      id: "user-id",
      name: "Test User",
      hasFinancialConnection: true,
      hasCompletedFinancialSync: true,
      myConnectionArray: [{ id: "connection-id", name: "Connection" }],
    });
    expect(ClientUserSchema.safeParse(user).success).toBe(true);
    expect("futurePrivateField" in user).toBe(false);
    expect("futurePrivateField" in user.myConnectionArray[0]).toBe(false);
  });

  test("reports unavailable bank capabilities", () => {
    const user = sanitizeUser({
      id: "user-id",
      name: "Test User",
      financialConnectionArray: [],
      myConnectionArray: [],
    });

    expect(user.hasFinancialConnection).toBe(false);
    expect(user.hasCompletedFinancialSync).toBe(false);
    expect(ClientUserSchema.safeParse(user).success).toBe(true);
  });
});
