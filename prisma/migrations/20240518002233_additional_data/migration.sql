/*
  Warnings:

  - A unique constraint covering the columns `[txId]` on the table `Split` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `originTxId` to the `Split` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userTotal` to the `Tx` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Split" ADD COLUMN     "originTxId" TEXT NOT NULL,
ALTER COLUMN "txId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tx" ADD COLUMN     "originTxId" TEXT,
ADD COLUMN     "userTotal" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Split_txId_key" ON "Split"("txId");

-- AddForeignKey
ALTER TABLE "Tx" ADD CONSTRAINT "Tx_originTxId_fkey" FOREIGN KEY ("originTxId") REFERENCES "Tx"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Split" ADD CONSTRAINT "Split_originTxId_fkey" FOREIGN KEY ("originTxId") REFERENCES "Tx"("id") ON DELETE CASCADE ON UPDATE CASCADE;
