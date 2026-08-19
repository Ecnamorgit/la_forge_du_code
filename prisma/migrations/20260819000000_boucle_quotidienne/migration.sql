-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bestStreak" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "streakShields" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shieldEverGranted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "questsCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "perfectBriefingRun" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastPerfectDay" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "dailyClaimed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "frame" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "emblem" TEXT,
ADD COLUMN     "cardBg" TEXT;

-- CreateTable
CREATE TABLE "UserUnlock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserUnlock_userId_itemId_key" ON "UserUnlock"("userId", "itemId");

-- CreateIndex
CREATE INDEX "StepCompletion_userId_completedAt_idx" ON "StepCompletion"("userId", "completedAt");

-- AddForeignKey
ALTER TABLE "UserUnlock" ADD CONSTRAINT "UserUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Les comptes existants ne doivent pas perdre leur historique de streak :
-- leur record de départ est leur streak courant.
UPDATE "User" SET "bestStreak" = "streak" WHERE "streak" > 1;
