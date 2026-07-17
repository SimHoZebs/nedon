import type { FinancialDataProvider, FinancialProvider } from "./types";

export class ProviderRegistry {
  private readonly providers: Map<FinancialProvider, FinancialDataProvider>;

  constructor(providers: FinancialDataProvider[]) {
    this.providers = new Map(
      providers.map((provider) => [provider.id, provider]),
    );
  }

  get(provider: FinancialProvider): FinancialDataProvider {
    const implementation = this.providers.get(provider);
    if (!implementation) {
      throw new Error(`Financial provider ${provider} is not configured`);
    }
    return implementation;
  }
}
