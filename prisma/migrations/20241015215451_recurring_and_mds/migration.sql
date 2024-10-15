/*
  Warnings:

  - Added the required column `MDS` to the `Tx` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recurring` to the `Tx` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tx" ADD COLUMN     "MDS" INTEGER NOT NULL,
ADD COLUMN     "recurring" BOOLEAN NOT NULL;
