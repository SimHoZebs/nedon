/*
  Warnings:

  - You are about to drop the column `userId` on the `CatSettings` table. All the data in the column will be lost.
  - You are about to drop the column `MDS` on the `ReceiptItem` table. All the data in the column will be lost.
  - You are about to drop the column `MDS` on the `Tx` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Tx` table. All the data in the column will be lost.
  - The `userTotal` column on the `Tx` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `ACCESS_TOKEN` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `ITEM_ID` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `PAYMENT_ID` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `PUBLIC_TOKEN` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `TRANSFER_ID` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Split` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GroupToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_connection` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `amount` on the `Cat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `userSettingsId` to the `CatSettings` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `budget` on the `CatSettings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `date` on the `Receipt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `subtotal` on the `Receipt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tax` on the `Receipt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tip` on the `Receipt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `grand_total` on the `Receipt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `unit_price` on the `ReceiptItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `ownerId` to the `Tx` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `amount` on the `Tx` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."MdsType" AS ENUM ('-1', 'MANDATORY', 'DISCRETIONARY', 'SAVING');

-- DropForeignKey
ALTER TABLE "public"."CatSettings" DROP CONSTRAINT "CatSettings_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Split" DROP CONSTRAINT "Split_originTxId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Split" DROP CONSTRAINT "Split_txId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Split" DROP CONSTRAINT "Split_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Tx" DROP CONSTRAINT "Tx_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_GroupToUser" DROP CONSTRAINT "_GroupToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_GroupToUser" DROP CONSTRAINT "_GroupToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_connection" DROP CONSTRAINT "_connection_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_connection" DROP CONSTRAINT "_connection_B_fkey";

-- AlterTable
ALTER TABLE "public"."Cat" DROP COLUMN "amount",
ADD COLUMN     "amount" MONEY NOT NULL;

-- AlterTable
ALTER TABLE "public"."CatSettings" DROP COLUMN "userId",
ADD COLUMN     "userSettingsId" TEXT NOT NULL,
DROP COLUMN "budget",
ADD COLUMN     "budget" MONEY NOT NULL;

-- AlterTable
ALTER TABLE "public"."Receipt" DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "subtotal",
ADD COLUMN     "subtotal" MONEY NOT NULL,
DROP COLUMN "tax",
ADD COLUMN     "tax" MONEY NOT NULL,
DROP COLUMN "tip",
ADD COLUMN     "tip" MONEY NOT NULL,
DROP COLUMN "grand_total",
ADD COLUMN     "grand_total" MONEY NOT NULL;

-- AlterTable
ALTER TABLE "public"."ReceiptItem" DROP COLUMN "MDS",
ADD COLUMN     "mds" "public"."MdsType" NOT NULL DEFAULT '-1',
DROP COLUMN "unit_price",
ADD COLUMN     "unit_price" MONEY NOT NULL;

-- AlterTable
ALTER TABLE "public"."Tx" DROP COLUMN "MDS",
DROP COLUMN "userId",
ADD COLUMN     "mds" "public"."MdsType" NOT NULL DEFAULT '-1',
ADD COLUMN     "ownerId" TEXT NOT NULL,
DROP COLUMN "userTotal",
ADD COLUMN     "userTotal" MONEY NOT NULL DEFAULT 0,
DROP COLUMN "amount",
ADD COLUMN     "amount" MONEY NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "ACCESS_TOKEN",
DROP COLUMN "ITEM_ID",
DROP COLUMN "PAYMENT_ID",
DROP COLUMN "PUBLIC_TOKEN",
DROP COLUMN "TRANSFER_ID",
ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "itemId" TEXT,
ADD COLUMN     "publicToken" TEXT,
ADD COLUMN     "transferId" TEXT;

-- DropTable
DROP TABLE "public"."Split";

-- DropTable
DROP TABLE "public"."_GroupToUser";

-- DropTable
DROP TABLE "public"."_connection";

-- CreateTable
CREATE TABLE "public"."UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_groupMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_groupMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_UserConnections" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserConnections_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_txSplits" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_txSplits_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "public"."UserSettings"("userId");

-- CreateIndex
CREATE INDEX "_groupMembers_B_index" ON "public"."_groupMembers"("B");

-- CreateIndex
CREATE INDEX "_UserConnections_B_index" ON "public"."_UserConnections"("B");

-- CreateIndex
CREATE INDEX "_txSplits_B_index" ON "public"."_txSplits"("B");

-- AddForeignKey
ALTER TABLE "public"."Tx" ADD CONSTRAINT "Tx_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CatSettings" ADD CONSTRAINT "CatSettings_userSettingsId_fkey" FOREIGN KEY ("userSettingsId") REFERENCES "public"."UserSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_groupMembers" ADD CONSTRAINT "_groupMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_groupMembers" ADD CONSTRAINT "_groupMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserConnections" ADD CONSTRAINT "_UserConnections_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserConnections" ADD CONSTRAINT "_UserConnections_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_txSplits" ADD CONSTRAINT "_txSplits_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Tx"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_txSplits" ADD CONSTRAINT "_txSplits_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
