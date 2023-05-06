-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "ACCESS_TOKEN" TEXT,
    "PUBLIC_TOKEN" TEXT,
    "ITEM_ID" TEXT,
    "TRANSFER_ID" TEXT,
    "PAYMENT_ID" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "transaction_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "iso_currency_code" TEXT,
    "unofficial_currency_code" TEXT,
    "category" TEXT[],
    "category_id" TEXT,
    "check_number" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "merchant_name" TEXT,
    "pending" BOOLEAN NOT NULL,
    "pending_transaction_id" TEXT,
    "authorized_date" TIMESTAMP(3) NOT NULL,
    "authorized_datetime" TIMESTAMP(3) NOT NULL,
    "payment_channel" TEXT,
    "account_owner" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "Location" (
    "transaction_id" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "postal_code" TEXT,
    "country" TEXT,
    "lat" TEXT,
    "lon" TEXT,
    "store_number" TEXT
);

-- CreateTable
CREATE TABLE "PaymentMeta" (
    "transaction_id" TEXT NOT NULL,
    "by_order_of" TEXT,
    "payee" TEXT,
    "payer" TEXT,
    "payment_method" TEXT,
    "payment_processor" TEXT,
    "ppd_id" TEXT,
    "reason" TEXT,
    "reference_number" TEXT
);

-- CreateTable
CREATE TABLE "_GroupToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_transaction_id_key" ON "Location"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMeta_transaction_id_key" ON "PaymentMeta"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupToUser_AB_unique" ON "_GroupToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupToUser_B_index" ON "_GroupToUser"("B");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMeta" ADD CONSTRAINT "PaymentMeta_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToUser" ADD CONSTRAINT "_GroupToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToUser" ADD CONSTRAINT "_GroupToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
