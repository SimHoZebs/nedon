/*
  Warnings:

  - You are about to drop the `newCat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "newCat" DROP CONSTRAINT "newCat_splitId_fkey";

-- DropTable
DROP TABLE "newCat";

-- CreateTable
CREATE TABLE "Cat" (
    "id" TEXT NOT NULL,
    "nameArray" TEXT[],
    "amount" DOUBLE PRECISION NOT NULL,
    "splitId" TEXT NOT NULL,

    CONSTRAINT "Cat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cat" ADD CONSTRAINT "Cat_splitId_fkey" FOREIGN KEY ("splitId") REFERENCES "Split"("id") ON DELETE CASCADE ON UPDATE CASCADE;
