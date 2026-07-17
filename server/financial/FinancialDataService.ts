import type { Result } from "@/util/type";

import { credentialVault } from "./CredentialVault";
import type { FinancialSyncService } from "./FinancialSyncService";
import type { ProviderRegistry } from "./providerRegistry";
import type {
  ConnectionCompletion,
  ConnectionFlow,
  FinancialProvider,
} from "./types";

import db from "server/util/db";

export class FinancialDataService {
  constructor(
    private readonly providers: ProviderRegistry,
    private readonly syncService: FinancialSyncService,
  ) {}

  beginConnection(
    provider: FinancialProvider,
    userId: string,
  ): Promise<ConnectionFlow> {
    return this.providers.get(provider).beginConnection(userId);
  }

  async completeConnection(
    userId: string,
    provider: FinancialProvider,
    completion: ConnectionCompletion,
  ): Promise<{
    connectionId: string;
    initialSync: Result<void, string>;
  }> {
    const completed = await this.providers
      .get(provider)
      .completeConnection(completion);
    if (!completed.externalId) {
      throw new Error("Provider did not return a connection identifier");
    }
    const connection = await db.financialConnection.upsert({
      where: {
        userId_provider_externalConnectionId: {
          userId,
          provider,
          externalConnectionId: completed.externalId,
        },
      },
      create: {
        userId,
        provider,
        externalConnectionId: completed.externalId,
        credential: credentialVault.encrypt(completed.credential),
      },
      update: {
        credential: credentialVault.encrypt(completed.credential),
        checkpoint: null,
        status: "ACTIVE",
        lastError: null,
      },
      select: { id: true },
    });
    const initialSync = await this.syncConnection(
      connection.id,
      new Date(Date.now() - 89 * 24 * 60 * 60 * 1000),
    );
    return { connectionId: connection.id, initialSync };
  }

  async syncConnection(
    connectionId: string,
    startDate: Date,
  ): Promise<Result<void, string>> {
    const connection = await db.financialConnection.findUnique({
      where: { id: connectionId },
    });
    if (!connection || connection.status === "DISCONNECTED") {
      return { ok: false, error: "Financial connection not found" };
    }

    await db.financialConnection.update({
      where: { id: connectionId },
      data: { lastSyncAttemptAt: new Date() },
    });

    try {
      const credential = credentialVault.decrypt(connection.credential);
      if (!credentialVault.isEncrypted(connection.credential)) {
        await db.financialConnection.update({
          where: { id: connection.id },
          data: { credential: credentialVault.encrypt(credential) },
        });
      }
      const result = await this.providers.get(connection.provider).sync({
        credential,
        checkpoint: connection.checkpoint,
        startDate,
      });
      await this.syncService.apply(connection.id, connection.userId, result);
      return { ok: true, value: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed";
      await db.financialConnection.update({
        where: { id: connectionId },
        data: { status: "ERROR", lastError: message.slice(0, 500) },
      });
      console.error(
        `Financial sync failed for connection ${connectionId}`,
        error,
      );
      return { ok: false, error: message };
    }
  }

  listConnections(userId: string) {
    return db.financialConnection.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        status: true,
        lastSyncSuccessAt: true,
      },
    });
  }

  listAccounts(userId: string) {
    return db.financialAccount.findMany({
      where: { connection: { userId }, active: true },
      select: {
        id: true,
        name: true,
        mask: true,
        type: true,
        subtype: true,
        currentBalance: true,
        availableBalance: true,
        currency: true,
        balanceDate: true,
      },
    });
  }
}
