/*
  Warnings:

  - You are about to drop the column `nameArray` on the `Cat` table. All the data in the column will be lost.
  - Added the required column `detailed` to the `Cat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primary` to the `Cat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Cat" DROP COLUMN "nameArray",
ADD COLUMN     "detailed" TEXT NOT NULL,
ADD COLUMN     "primary" TEXT NOT NULL;
