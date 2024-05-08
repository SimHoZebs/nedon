/*
  Warnings:

  - Made the column `txId` on table `Cat` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Cat" DROP CONSTRAINT "Cat_txId_fkey";

-- AlterTable
ALTER TABLE "Cat" ALTER COLUMN "txId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Cat" ADD CONSTRAINT "Cat_txId_fkey" FOREIGN KEY ("txId") REFERENCES "Tx"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
