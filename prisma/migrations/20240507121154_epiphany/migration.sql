/*
  Warnings:

  - You are about to drop the column `splitId` on the `Cat` table. All the data in the column will be lost.
  - You are about to drop the column `plaidId` on the `Split` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Tx` table. All the data in the column will be lost.
  - Added the required column `name` to the `Cat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Split` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Tx` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cat" DROP CONSTRAINT "Cat_splitId_fkey";

-- DropForeignKey
ALTER TABLE "Tx" DROP CONSTRAINT "Tx_ownerId_fkey";

-- AlterTable
ALTER TABLE "Cat" DROP COLUMN "splitId",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "txId" TEXT;

-- AlterTable
ALTER TABLE "Split" DROP COLUMN "plaidId",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Tx" DROP COLUMN "ownerId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Tx" ADD CONSTRAINT "Tx_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cat" ADD CONSTRAINT "Cat_txId_fkey" FOREIGN KEY ("txId") REFERENCES "Tx"("id") ON DELETE SET NULL ON UPDATE CASCADE;
