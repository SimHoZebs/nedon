/*
  Warnings:

  - You are about to drop the column `budget` on the `Cat` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Cat` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Cat" DROP CONSTRAINT "Cat_id_fkey";

-- AlterTable
ALTER TABLE "Cat" DROP COLUMN "budget",
DROP COLUMN "name";

-- CreateTable
CREATE TABLE "CatSettings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "parentId" TEXT,
    "userId" TEXT,

    CONSTRAINT "CatSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CatSettings" ADD CONSTRAINT "CatSettings_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CatSettings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatSettings" ADD CONSTRAINT "CatSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
