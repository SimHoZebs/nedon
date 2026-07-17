import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const prefix = "v1";

export class CredentialVault {
  constructor(private readonly key?: Buffer) {}

  private getKey(): Buffer {
    const key =
      this.key ||
      (process.env.FINANCIAL_DATA_ENCRYPTION_KEY
        ? Buffer.from(process.env.FINANCIAL_DATA_ENCRYPTION_KEY, "base64")
        : null);
    if (!key || key.length !== 32) {
      throw new Error(
        "FINANCIAL_DATA_ENCRYPTION_KEY must be a base64-encoded 32-byte key",
      );
    }
    return key;
  }

  isEncrypted(value: string): boolean {
    return value.startsWith(`${prefix}:`);
  }

  encrypt(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.getKey(), iv);
    const ciphertext = Buffer.concat([
      cipher.update(value, "utf8"),
      cipher.final(),
    ]);
    return [
      prefix,
      iv.toString("base64"),
      cipher.getAuthTag().toString("base64"),
      ciphertext.toString("base64"),
    ].join(":");
  }

  decrypt(value: string): string {
    if (!this.isEncrypted(value)) return value;
    const [, ivValue, authTagValue, ciphertextValue] = value.split(":");
    if (!ivValue || !authTagValue || !ciphertextValue) {
      throw new Error("Stored financial credential is malformed");
    }
    const decipher = createDecipheriv(
      "aes-256-gcm",
      this.getKey(),
      Buffer.from(ivValue, "base64"),
    );
    decipher.setAuthTag(Buffer.from(authTagValue, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, "base64")),
      decipher.final(),
    ]).toString("utf8");
  }
}

export const credentialVault = new CredentialVault();
