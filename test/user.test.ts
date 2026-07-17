import { ClientUserSchema } from "../lib/types/user";
import { sanitizeUser } from "../server/util/user";

import { describe, expect, test } from "vitest";

describe("sanitizeUser", () => {
  test("replaces private bank tokens with capability flags", () => {
    const databaseUser = {
      id: "user-id",
      name: "Test User",
      bankAccessToken: "access-token",
      bankSyncToken: "sync-token",
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
      hasAccessToken: true,
      hasBankSyncToken: true,
      myConnectionArray: [{ id: "connection-id", name: "Connection" }],
    });
    expect(ClientUserSchema.safeParse(user).success).toBe(true);
    expect("bankAccessToken" in user).toBe(false);
    expect("bankSyncToken" in user).toBe(false);
    expect("futurePrivateField" in user).toBe(false);
    expect("futurePrivateField" in user.myConnectionArray[0]).toBe(false);
  });

  test("reports unavailable bank capabilities", () => {
    const user = sanitizeUser({
      id: "user-id",
      name: "Test User",
      bankAccessToken: null,
      bankSyncToken: null,
      myConnectionArray: [],
    });

    expect(user.hasAccessToken).toBe(false);
    expect(user.hasBankSyncToken).toBe(false);
    expect(ClientUserSchema.safeParse(user).success).toBe(true);
  });
});
