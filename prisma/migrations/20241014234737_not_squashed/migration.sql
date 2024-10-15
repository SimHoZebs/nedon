/*
  Warnings:

  - You are about to drop the column `total` on the `Receipt` table. All the data in the column will be lost.
  - Added the required column `online_link` to the `Receipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Receipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Receipt" DROP COLUMN "total",
ADD COLUMN     "online_link" TEXT NOT NULL,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL;
