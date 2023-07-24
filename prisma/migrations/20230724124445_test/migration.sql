/*
  Warnings:

  - You are about to drop the column `amount` on the `Split` table. All the data in the column will be lost.
  - You are about to drop the column `categoryTreeId` on the `Split` table. All the data in the column will be lost.
  - You are about to drop the `CategoryTree` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `transactionId` to the `Split` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CategoryTree" DROP CONSTRAINT "CategoryTree_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "Split" DROP CONSTRAINT "Split_categoryTreeId_fkey";

-- AlterTable
ALTER TABLE "Split" DROP COLUMN "amount",
DROP COLUMN "categoryTreeId",
ADD COLUMN     "transactionId" TEXT NOT NULL;

-- DropTable
DROP TABLE "CategoryTree";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "nameArray" TEXT[],
    "amount" DOUBLE PRECISION NOT NULL,
    "splitId" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_splitId_fkey" FOREIGN KEY ("splitId") REFERENCES "Split"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Split" ADD CONSTRAINT "Split_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
