-- CreateEnum
CREATE TYPE "TxKind" AS ENUM ('ORIGINAL', 'USER', 'SPLIT');

-- AlterTable
ALTER TABLE "Tx" ADD COLUMN     "kind" "TxKind" NOT NULL DEFAULT 'USER',
ADD COLUMN     "originalBankTxId" TEXT;

-- AddForeignKey
ALTER TABLE "Tx" ADD CONSTRAINT "Tx_originalBankTxId_fkey" FOREIGN KEY ("originalBankTxId") REFERENCES "Tx"("id") ON DELETE SET NULL ON UPDATE CASCADE;

