import { ProviderRegistry } from "./providerRegistry";
import type { FinancialDataProvider } from "./types";

import { describe, expect, test } from "vitest";

const provider = { id: "PLAID" } as FinancialDataProvider;

describe("ProviderRegistry", () => {
  test("returns the configured implementation", () => {
    expect(new ProviderRegistry([provider]).get("PLAID")).toBe(provider);
  });

  test("rejects an unavailable implementation", () => {
    expect(() => new ProviderRegistry([]).get("SIMPLEFIN")).toThrow(
      "Financial provider SIMPLEFIN is not configured",
    );
  });
});
