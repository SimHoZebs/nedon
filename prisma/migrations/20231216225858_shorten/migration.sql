/*
  Warnings:

  - You are about to drop the column `transactionId` on the `Split` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `txId` to the `Split` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_splitId_fkey";

-- DropForeignKey
ALTER TABLE "Split" DROP CONSTRAINT "Split_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_ownerId_fkey";

-- AlterTable
ALTER TABLE "Split" DROP COLUMN "transactionId",
ADD COLUMN     "txId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Transaction";

-- CreateTable
CREATE TABLE "Tx" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Tx_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cat" (
    "id" TEXT NOT NULL,
    "nameArray" TEXT[],
    "amount" DOUBLE PRECISION NOT NULL,
    "splitId" TEXT NOT NULL,

    CONSTRAINT "Cat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tx" ADD CONSTRAINT "Tx_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cat" ADD CONSTRAINT "Cat_splitId_fkey" FOREIGN KEY ("splitId") REFERENCES "Split"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Split" ADD CONSTRAINT "Split_txId_fkey" FOREIGN KEY ("txId") REFERENCES "Tx"("id") ON DELETE CASCADE ON UPDATE CASCADE;
