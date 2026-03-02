-- CreateTable
CREATE TABLE "OrderMessage" (
  "id" SERIAL NOT NULL,
  "orderId" INTEGER NOT NULL,
  "senderId" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OrderMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderMessage" ADD CONSTRAINT "OrderMessage_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderMessage" ADD CONSTRAINT "OrderMessage_senderId_fkey"
FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
