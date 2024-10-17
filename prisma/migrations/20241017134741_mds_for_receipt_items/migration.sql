/*
  Warnings:

  - Added the required column `location` to the `Receipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `MDS` to the `ReceiptItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cat" ALTER COLUMN "amount" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "location" TEXT NOT NULL,
ALTER COLUMN "currency" DROP DEFAULT,
ALTER COLUMN "tax" DROP DEFAULT,
ALTER COLUMN "tip" DROP DEFAULT,
ALTER COLUMN "grand_total" DROP DEFAULT,
ALTER COLUMN "subtotal" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ReceiptItem" ADD COLUMN     "MDS" INTEGER NOT NULL,
ALTER COLUMN "quantity" DROP DEFAULT,
ALTER COLUMN "unit_price" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Split" ALTER COLUMN "amount" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Tx" ALTER COLUMN "amount" DROP DEFAULT,
ALTER COLUMN "MDS" DROP DEFAULT;
