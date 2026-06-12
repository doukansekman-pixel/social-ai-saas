-- CreateTable
CREATE TABLE "WeeklyMatch" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT,
    "sport" TEXT,
    "competition" TEXT,
    "matchCode" TEXT,
    "matchDay" TEXT,
    "matchDate" TEXT,
    "matchTime" TEXT,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 0,
    "aiReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyMatch_pkey" PRIMARY KEY ("id")
);
