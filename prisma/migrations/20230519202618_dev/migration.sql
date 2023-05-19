-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "datetime" TEXT,
ADD COLUMN     "transaction_code" TEXT,
ALTER COLUMN "date" SET DATA TYPE TEXT,
ALTER COLUMN "authorized_date" SET DATA TYPE TEXT,
ALTER COLUMN "authorized_datetime" SET DATA TYPE TEXT;
