CREATE TYPE "FinancialProvider" AS ENUM ('PLAID', 'SIMPLEFIN');
CREATE TYPE "FinancialConnectionStatus" AS ENUM ('ACTIVE', 'ERROR', 'DISCONNECTED');

CREATE TABLE "FinancialConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "FinancialProvider" NOT NULL,
    "externalConnectionId" TEXT,
    "credential" TEXT NOT NULL,
    "checkpoint" TEXT,
    "status" "FinancialConnectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastSyncAttemptAt" TIMESTAMP(3),
    "lastSyncSuccessAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialConnection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinancialAccount" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mask" TEXT,
    "type" TEXT NOT NULL,
    "subtype" TEXT,
    "currentBalance" MONEY,
    "availableBalance" MONEY,
    "currency" TEXT,
    "balanceDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialAccount_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Tx"
ADD COLUMN "externalTransactionId" TEXT,
ADD COLUMN "financialAccountId" TEXT,
ADD COLUMN "providerPending" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "FinancialConnection_userId_idx" ON "FinancialConnection"("userId");
CREATE UNIQUE INDEX "FinancialConnection_userId_provider_externalConnectionId_key"
ON "FinancialConnection"("userId", "provider", "externalConnectionId");
CREATE UNIQUE INDEX "FinancialAccount_connectionId_externalId_key"
ON "FinancialAccount"("connectionId", "externalId");
CREATE UNIQUE INDEX "Tx_financialAccountId_externalTransactionId_key"
ON "Tx"("financialAccountId", "externalTransactionId");

ALTER TABLE "FinancialConnection" ADD CONSTRAINT "FinancialConnection_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FinancialAccount" ADD CONSTRAINT "FinancialAccount_connectionId_fkey"
FOREIGN KEY ("connectionId") REFERENCES "FinancialConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tx" ADD CONSTRAINT "Tx_financialAccountId_fkey"
FOREIGN KEY ("financialAccountId") REFERENCES "FinancialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "FinancialConnection" (
    "id", "userId", "provider", "credential", "checkpoint"
)
SELECT
    'legacy_plaid_' || md5("id"),
    "id",
    'PLAID'::"FinancialProvider",
    "bankAccessToken",
    "bankSyncToken"
FROM "User"
WHERE "bankAccessToken" IS NOT NULL;

INSERT INTO "FinancialAccount" (
    "id", "connectionId", "externalId", "name", "type"
)
SELECT DISTINCT
    'legacy_account_' || md5(tx."ownerId" || ':' || tx."accountId"),
    connection."id",
    tx."accountId",
    tx."accountId",
    'unknown'
FROM "Tx" tx
JOIN "FinancialConnection" connection ON connection."userId" = tx."ownerId"
WHERE tx."kind" = 'ORIGINAL'
  AND tx."accountId" IS NOT NULL;

UPDATE "Tx" tx
SET
    "externalTransactionId" = tx."bankId",
    "financialAccountId" = account."id"
FROM "FinancialConnection" connection
JOIN "FinancialAccount" account ON account."connectionId" = connection."id"
WHERE connection."userId" = tx."ownerId"
  AND account."externalId" = tx."accountId"
  AND tx."kind" = 'ORIGINAL';

UPDATE "Tx" editable
SET "financialAccountId" = original."financialAccountId"
FROM "Tx" original
WHERE editable."originalBankTxId" = original."id"
  AND original."financialAccountId" IS NOT NULL;
