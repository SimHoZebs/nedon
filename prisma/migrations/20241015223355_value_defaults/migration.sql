-- AlterTable
ALTER TABLE "Cat" ALTER COLUMN "amount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Receipt" ALTER COLUMN "currency" SET DEFAULT 'USD',
ALTER COLUMN "tax" SET DEFAULT 0,
ALTER COLUMN "tip" SET DEFAULT 0,
ALTER COLUMN "grand_total" SET DEFAULT 0,
ALTER COLUMN "subtotal" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "ReceiptItem" ALTER COLUMN "quantity" SET DEFAULT 1,
ALTER COLUMN "unit_price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Split" ALTER COLUMN "amount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Tx" ALTER COLUMN "userTotal" SET DEFAULT 0,
ALTER COLUMN "amount" SET DEFAULT 0,
ALTER COLUMN "MDS" SET DEFAULT -1,
ALTER COLUMN "recurring" SET DEFAULT false;
