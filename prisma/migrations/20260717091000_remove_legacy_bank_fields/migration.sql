DROP INDEX "Tx_bankId_key";

ALTER TABLE "User"
DROP COLUMN "bankAccessToken",
DROP COLUMN "bankSyncToken";

ALTER TABLE "Tx"
DROP COLUMN "bankId",
DROP COLUMN "accountId";
