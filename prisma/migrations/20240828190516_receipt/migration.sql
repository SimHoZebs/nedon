-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "is_receipt" BOOLEAN NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "merchant" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL,
    "tip" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "grand_total" DOUBLE PRECISION NOT NULL,
    "payment_method" TEXT NOT NULL,
    "txId" TEXT NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "receiptId" TEXT NOT NULL,

    CONSTRAINT "ReceiptItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_txId_key" ON "Receipt"("txId");

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_txId_fkey" FOREIGN KEY ("txId") REFERENCES "Tx"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptItem" ADD CONSTRAINT "ReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
