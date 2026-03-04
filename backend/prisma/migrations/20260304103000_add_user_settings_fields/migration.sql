-- AlterTable
ALTER TABLE "User"
ADD COLUMN "avatarUrl" TEXT,
ADD COLUMN "title" TEXT,
ADD COLUMN "country" TEXT,
ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
ADD COLUMN "language" TEXT NOT NULL DEFAULT 'English',
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "orderNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "messageNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "marketingNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "profileVisibility" TEXT NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN "showOnlineStatus" BOOLEAN NOT NULL DEFAULT true;
