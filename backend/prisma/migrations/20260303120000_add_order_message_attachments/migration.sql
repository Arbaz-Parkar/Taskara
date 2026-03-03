-- CreateTable
CREATE TABLE "OrderMessageAttachment" (
  "id" SERIAL NOT NULL,
  "messageId" INTEGER NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrderMessageAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderMessageAttachment"
ADD CONSTRAINT "OrderMessageAttachment_messageId_fkey"
FOREIGN KEY ("messageId") REFERENCES "OrderMessage"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
