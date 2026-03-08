DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DisputeStatus') THEN
    CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "Dispute" (
  "id" SERIAL NOT NULL,
  "orderId" INTEGER NOT NULL,
  "buyerId" INTEGER NOT NULL,
  "sellerId" INTEGER NOT NULL,
  "raisedById" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Dispute_orderId_key" ON "Dispute"("orderId");

CREATE TABLE IF NOT EXISTS "DisputeMessage" (
  "id" SERIAL NOT NULL,
  "disputeId" INTEGER NOT NULL,
  "senderId" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DisputeMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DisputeMessageAttachment" (
  "id" SERIAL NOT NULL,
  "messageId" INTEGER NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DisputeMessageAttachment_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Dispute_orderId_fkey'
  ) THEN
    ALTER TABLE "Dispute"
      ADD CONSTRAINT "Dispute_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Dispute_buyerId_fkey'
  ) THEN
    ALTER TABLE "Dispute"
      ADD CONSTRAINT "Dispute_buyerId_fkey"
      FOREIGN KEY ("buyerId") REFERENCES "User"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Dispute_sellerId_fkey'
  ) THEN
    ALTER TABLE "Dispute"
      ADD CONSTRAINT "Dispute_sellerId_fkey"
      FOREIGN KEY ("sellerId") REFERENCES "User"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Dispute_raisedById_fkey'
  ) THEN
    ALTER TABLE "Dispute"
      ADD CONSTRAINT "Dispute_raisedById_fkey"
      FOREIGN KEY ("raisedById") REFERENCES "User"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'DisputeMessage_disputeId_fkey'
  ) THEN
    ALTER TABLE "DisputeMessage"
      ADD CONSTRAINT "DisputeMessage_disputeId_fkey"
      FOREIGN KEY ("disputeId") REFERENCES "Dispute"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'DisputeMessage_senderId_fkey'
  ) THEN
    ALTER TABLE "DisputeMessage"
      ADD CONSTRAINT "DisputeMessage_senderId_fkey"
      FOREIGN KEY ("senderId") REFERENCES "User"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'DisputeMessageAttachment_messageId_fkey'
  ) THEN
    ALTER TABLE "DisputeMessageAttachment"
      ADD CONSTRAINT "DisputeMessageAttachment_messageId_fkey"
      FOREIGN KEY ("messageId") REFERENCES "DisputeMessage"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
