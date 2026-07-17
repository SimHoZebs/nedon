import { SimpleFinAccountSetSchema } from "./simpleFinSchemas";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

type AddressResolver = (
  hostname: string,
) => Promise<Array<{ address: string; family: number }>>;

function isPrivateAddress(address: string): boolean {
  if (
    address === "::1" ||
    address.startsWith("fe80:") ||
    address.startsWith("fc") ||
    address.startsWith("fd")
  ) {
    return true;
  }
  if (isIP(address) !== 4) return false;
  const [first, second] = address.split(".").map(Number);
  return (
    first === 10 ||
    first === 127 ||
    first === 0 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

export function parseSimpleFinToken(token: string): URL {
  const decoded = Buffer.from(token.trim(), "base64").toString("utf8");
  if (!decoded) throw new Error("Invalid SimpleFIN Setup Token");
  try {
    return new URL(decoded);
  } catch {
    throw new Error("Invalid SimpleFIN Setup Token");
  }
}

export class SimpleFinClient {
  constructor(
    private readonly fetcher: typeof fetch = fetch,
    private readonly resolve: AddressResolver = async (hostname) =>
      lookup(hostname, { all: true }),
  ) {}

  private async assertSafeUrl(url: URL): Promise<void> {
    if (url.protocol !== "https:") {
      throw new Error("SimpleFIN requires an HTTPS URL");
    }
    if (url.hostname === "localhost" || isPrivateAddress(url.hostname)) {
      throw new Error("SimpleFIN URL points to a private network");
    }
    const addresses = await this.resolve(url.hostname);
    if (
      !addresses.length ||
      addresses.some(({ address }) => isPrivateAddress(address))
    ) {
      throw new Error("SimpleFIN URL points to a private network");
    }
  }

  async claim(setupToken: string): Promise<string> {
    const claimUrl = parseSimpleFinToken(setupToken);
    await this.assertSafeUrl(claimUrl);
    const response = await this.fetcher(claimUrl, {
      method: "POST",
      redirect: "manual",
    });
    if (response.status === 403) {
      throw new Error(
        "SimpleFIN token was rejected and may be compromised; revoke it and create another",
      );
    }
    if (!response.ok) throw new Error("Unable to claim SimpleFIN token");

    const accessUrl = new URL((await response.text()).trim());
    await this.assertSafeUrl(accessUrl);
    return accessUrl.toString();
  }

  async getAccounts(accessUrlValue: string, start: Date, end: Date) {
    const accessUrl = new URL(accessUrlValue);
    await this.assertSafeUrl(accessUrl);
    const username = decodeURIComponent(accessUrl.username);
    const password = decodeURIComponent(accessUrl.password);
    accessUrl.username = "";
    accessUrl.password = "";
    accessUrl.pathname = `${accessUrl.pathname.replace(/\/$/, "")}/accounts`;
    accessUrl.searchParams.set(
      "start-date",
      `${Math.floor(start.getTime() / 1000)}`,
    );
    accessUrl.searchParams.set(
      "end-date",
      `${Math.floor(end.getTime() / 1000)}`,
    );
    accessUrl.searchParams.set("pending", "1");
    accessUrl.searchParams.set("version", "2");

    const response = await this.fetcher(accessUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
      },
      redirect: "manual",
    });
    if (response.status === 403) {
      throw new Error("SimpleFIN connection is no longer authorized");
    }
    if (!response.ok) throw new Error("Unable to retrieve SimpleFIN accounts");
    return SimpleFinAccountSetSchema.parse(await response.json());
  }
}
