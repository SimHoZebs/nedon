/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `budget` to the `Cat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Cat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_id_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_splitId_fkey";

-- AlterTable
ALTER TABLE "Cat" ADD COLUMN     "budget" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "Category";

-- AddForeignKey
ALTER TABLE "Cat" ADD CONSTRAINT "Cat_id_fkey" FOREIGN KEY ("id") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
