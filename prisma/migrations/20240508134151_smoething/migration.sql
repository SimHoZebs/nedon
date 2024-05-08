/*
  Warnings:

  - Made the column `userId` on table `CatSettings` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CatSettings" DROP CONSTRAINT "CatSettings_userId_fkey";

-- AlterTable
ALTER TABLE "CatSettings" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "CatSettings" ADD CONSTRAINT "CatSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
