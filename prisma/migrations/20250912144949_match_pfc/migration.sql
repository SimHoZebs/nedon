/*
  Warnings:

  - You are about to drop the column `name` on the `Cat` table. All the data in the column will be lost.
  - Added the required column `description` to the `Cat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Cat" DROP COLUMN "name",
ADD COLUMN     "description" TEXT NOT NULL;
