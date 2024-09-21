/*
  Warnings:

  - A unique constraint covering the columns `[plaidId]` on the table `Tx` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account_id` to the `Tx` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Tx` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Tx` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Tx` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Tx` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_channel` to the `Tx` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_meta` to the `Tx` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pending` to the `Tx` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_id` to the `Tx` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tx" ADD COLUMN     "account_id" TEXT NOT NULL,
ADD COLUMN     "account_owner" TEXT,
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "authorized_date" TEXT,
ADD COLUMN     "authorized_datetime" TEXT,
ADD COLUMN     "category" TEXT[],
ADD COLUMN     "category_id" TEXT,
ADD COLUMN     "check_number" TEXT,
ADD COLUMN     "counterparties" TEXT[],
ADD COLUMN     "date" TEXT NOT NULL,
ADD COLUMN     "datetime" TEXT,
ADD COLUMN     "iso_currency_code" TEXT,
ADD COLUMN     "location" JSONB NOT NULL,
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "merchant_entity_id" TEXT,
ADD COLUMN     "merchant_name" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "original_description" TEXT,
ADD COLUMN     "payment_channel" TEXT NOT NULL,
ADD COLUMN     "payment_meta" JSONB NOT NULL,
ADD COLUMN     "pending" BOOLEAN NOT NULL,
ADD COLUMN     "pending_transaction_id" TEXT,
ADD COLUMN     "personal_finance_category" JSONB,
ADD COLUMN     "personal_finance_category_icon_url" TEXT,
ADD COLUMN     "transaction_code" TEXT,
ADD COLUMN     "transaction_id" TEXT NOT NULL,
ADD COLUMN     "transaction_type" TEXT,
ADD COLUMN     "unofficial_currency_code" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tx_plaidId_key" ON "Tx"("plaidId");
