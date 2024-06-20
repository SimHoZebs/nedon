-- CreateTable
CREATE TABLE "_connection" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_connection_AB_unique" ON "_connection"("A", "B");

-- CreateIndex
CREATE INDEX "_connection_B_index" ON "_connection"("B");

-- AddForeignKey
ALTER TABLE "_connection" ADD CONSTRAINT "_connection_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_connection" ADD CONSTRAINT "_connection_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
