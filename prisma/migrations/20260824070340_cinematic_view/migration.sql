-- CreateTable
CREATE TABLE "CinematicView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cinematicId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CinematicView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CinematicView_userId_idx" ON "CinematicView"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CinematicView_userId_cinematicId_key" ON "CinematicView"("userId", "cinematicId");

-- AddForeignKey
ALTER TABLE "CinematicView" ADD CONSTRAINT "CinematicView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
