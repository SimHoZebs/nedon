/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Split` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Split` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Split" DROP CONSTRAINT "Split_ownerId_fkey";

-- AlterTable
ALTER TABLE "Split" DROP COLUMN "ownerId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Split" ADD CONSTRAINT "Split_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
