-- DropForeignKey
ALTER TABLE "Receipt" DROP CONSTRAINT "Receipt_txId_fkey";

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_txId_fkey" FOREIGN KEY ("txId") REFERENCES "Tx"("id") ON DELETE CASCADE ON UPDATE CASCADE;
