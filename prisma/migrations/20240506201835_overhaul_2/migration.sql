/*
  Warnings:

  - You are about to drop the column `txId` on the `newCat` table. All the data in the column will be lost.
  - You are about to drop the `_splitUserArray` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `plaidId` on table `Tx` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `splitId` to the `newCat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_splitUserArray" DROP CONSTRAINT "_splitUserArray_A_fkey";

-- DropForeignKey
ALTER TABLE "_splitUserArray" DROP CONSTRAINT "_splitUserArray_B_fkey";

-- DropForeignKey
ALTER TABLE "newCat" DROP CONSTRAINT "newCat_txId_fkey";

-- AlterTable
ALTER TABLE "Tx" ALTER COLUMN "plaidId" SET NOT NULL;

-- AlterTable
ALTER TABLE "newCat" DROP COLUMN "txId",
ADD COLUMN     "splitId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_splitUserArray";

-- CreateTable
CREATE TABLE "Split" (
    "id" TEXT NOT NULL,
    "plaidId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "txId" TEXT NOT NULL,

    CONSTRAINT "Split_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Split" ADD CONSTRAINT "Split_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Split" ADD CONSTRAINT "Split_txId_fkey" FOREIGN KEY ("txId") REFERENCES "Tx"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newCat" ADD CONSTRAINT "newCat_splitId_fkey" FOREIGN KEY ("splitId") REFERENCES "Split"("id") ON DELETE CASCADE ON UPDATE CASCADE;
