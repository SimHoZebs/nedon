import type {
  ConnectionCompletion,
  ConnectionFlow,
  FinancialDataProvider,
  ProviderConnection,
  ProviderSyncResult,
} from "../../types";
import { SimpleFinClient } from "./SimpleFinClient";
import {
  mapSimpleFinAccounts,
  mapSimpleFinTransactions,
} from "./simpleFinMappers";

import { createHash } from "node:crypto";

const maximumWindowMilliseconds = 89 * 24 * 60 * 60 * 1000;

export class SimpleFinProvider implements FinancialDataProvider {
  readonly id = "SIMPLEFIN" as const;

  constructor(private readonly client = new SimpleFinClient()) {}

  async beginConnection(_userId: string): Promise<ConnectionFlow> {
    return {
      type: "tokenInput",
      createUrl:
        process.env.SIMPLEFIN_CREATE_URL ||
        "https://bridge.simplefin.org/simplefin/create",
    };
  }

  async completeConnection(
    completion: ConnectionCompletion,
  ): Promise<ProviderConnection> {
    if (completion.type !== "setupToken") {
      throw new Error("SimpleFIN requires a Setup Token");
    }
    const accessUrl = await this.client.claim(completion.token);
    return {
      externalId: createHash("sha256").update(accessUrl).digest("hex"),
      credential: accessUrl,
    };
  }

  async sync(input: {
    credential: string;
    checkpoint: string | null;
    startDate: Date;
  }): Promise<ProviderSyncResult> {
    const observedTo = new Date();
    const earliest = new Date(observedTo.getTime() - maximumWindowMilliseconds);
    const observedFrom =
      input.startDate > earliest ? input.startDate : earliest;
    const data = await this.client.getAccounts(
      input.credential,
      observedFrom,
      observedTo,
    );
    const complete = !data.errlist.some(
      (error) =>
        error.code === "act.failed" || error.code === "act.missingdata",
    );

    return {
      mode: "snapshot",
      accounts: mapSimpleFinAccounts(data),
      transactions: mapSimpleFinTransactions(data),
      observedFrom,
      observedTo,
      complete,
      checkpoint: observedTo.toISOString(),
    };
  }
}

export const simpleFinProvider = new SimpleFinProvider();
