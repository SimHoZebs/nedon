import { CredentialVault } from "./CredentialVault";

import { describe, expect, test } from "vitest";

describe("CredentialVault", () => {
  test("round-trips without storing the credential in plaintext", () => {
    const vault = new CredentialVault(Buffer.alloc(32, 7));
    const credential = "https://user:secret@example.com/simplefin";
    const encrypted = vault.encrypt(credential);

    expect(encrypted).not.toContain(credential);
    expect(vault.decrypt(encrypted)).toBe(credential);
  });

  test("accepts legacy plaintext for lazy migration", () => {
    const vault = new CredentialVault(Buffer.alloc(32, 7));
    expect(vault.decrypt("legacy-plaid-token")).toBe("legacy-plaid-token");
  });
});
