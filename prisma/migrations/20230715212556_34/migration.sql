/*
  Warnings:

  - You are about to drop the column `transactionId` on the `Split` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryTreeId` to the `Split` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "Split" DROP CONSTRAINT "Split_transactionId_fkey";

-- AlterTable
ALTER TABLE "Split" DROP COLUMN "transactionId",
ADD COLUMN     "categoryTreeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Category";

-- CreateTable
CREATE TABLE "CategoryTree" (
    "id" TEXT NOT NULL,
    "nameArray" TEXT[],
    "amount" DOUBLE PRECISION NOT NULL,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "CategoryTree_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CategoryTree" ADD CONSTRAINT "CategoryTree_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Split" ADD CONSTRAINT "Split_categoryTreeId_fkey" FOREIGN KEY ("categoryTreeId") REFERENCES "CategoryTree"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
