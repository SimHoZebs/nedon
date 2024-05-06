/*
  Warnings:

  - You are about to drop the `Cat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Split` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Cat" DROP CONSTRAINT "Cat_splitId_fkey";

-- DropForeignKey
ALTER TABLE "Split" DROP CONSTRAINT "Split_txId_fkey";

-- DropForeignKey
ALTER TABLE "Split" DROP CONSTRAINT "Split_userId_fkey";

-- AlterTable
ALTER TABLE "Tx" ADD COLUMN     "plaidId" TEXT;

-- DropTable
DROP TABLE "Cat";

-- DropTable
DROP TABLE "Split";

-- CreateTable
CREATE TABLE "newCat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "txId" TEXT NOT NULL,

    CONSTRAINT "newCat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_splitUserArray" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_splitUserArray_AB_unique" ON "_splitUserArray"("A", "B");

-- CreateIndex
CREATE INDEX "_splitUserArray_B_index" ON "_splitUserArray"("B");

-- AddForeignKey
ALTER TABLE "newCat" ADD CONSTRAINT "newCat_txId_fkey" FOREIGN KEY ("txId") REFERENCES "Tx"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_splitUserArray" ADD CONSTRAINT "_splitUserArray_A_fkey" FOREIGN KEY ("A") REFERENCES "Tx"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_splitUserArray" ADD CONSTRAINT "_splitUserArray_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
