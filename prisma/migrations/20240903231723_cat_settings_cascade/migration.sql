-- DropForeignKey
ALTER TABLE "CatSettings" DROP CONSTRAINT "CatSettings_parentId_fkey";

-- DropForeignKey
ALTER TABLE "CatSettings" DROP CONSTRAINT "CatSettings_userId_fkey";

-- AddForeignKey
ALTER TABLE "CatSettings" ADD CONSTRAINT "CatSettings_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CatSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatSettings" ADD CONSTRAINT "CatSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
