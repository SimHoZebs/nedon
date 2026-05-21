-- DropIndex
DROP INDEX "Tx_plaidId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "accessToken",
DROP COLUMN "cursor",
DROP COLUMN "itemId",
DROP COLUMN "publicToken",
DROP COLUMN "transferId",
ADD COLUMN     "bankAccessToken" TEXT,
ADD COLUMN     "bankSyncToken" TEXT;

-- AlterTable
ALTER TABLE "Tx" DROP COLUMN "plaidId",
DROP COLUMN "plaidTx",
ADD COLUMN     "bankId" TEXT,
ADD COLUMN     "isoCurrencyCode" TEXT,
ADD COLUMN     "locationAddress" TEXT,
ADD COLUMN     "locationCity" TEXT,
ADD COLUMN     "locationCountry" TEXT,
ADD COLUMN     "locationPostalCode" TEXT,
ADD COLUMN     "locationRegion" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tx_bankId_key" ON "Tx"("bankId");

