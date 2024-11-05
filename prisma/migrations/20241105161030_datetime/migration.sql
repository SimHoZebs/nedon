/*
  Warnings:

  - You are about to drop the column `date` on the `Tx` table. All the data in the column will be lost.
  - The `datetime` column on the `Tx` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `authorizedDatetime` to the `Tx` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tx" DROP COLUMN "date",
ADD COLUMN     "authorizedDatetime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "datetime",
ADD COLUMN     "datetime" TIMESTAMP(3);
