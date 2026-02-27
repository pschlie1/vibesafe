/*
  Warnings:

  - Added the required column `orgId` to the `MonitoredApp` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "orgId" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "orgId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invite_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'FREE',
    "status" TEXT NOT NULL DEFAULT 'TRIALING',
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "currentPeriodStart" DATETIME,
    "currentPeriodEnd" DATETIME,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "maxApps" INTEGER NOT NULL DEFAULT 2,
    "maxUsers" INTEGER NOT NULL DEFAULT 1,
    "trialEndsAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FindingAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "findingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FindingAssignment_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FindingAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AlertConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "destination" TEXT NOT NULL,
    "minSeverity" TEXT NOT NULL DEFAULT 'HIGH',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AlertConfig_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertConfigId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    CONSTRAINT "Notification_alertConfigId_fkey" FOREIGN KEY ("alertConfigId") REFERENCES "AlertConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "lastUsedAt" DATETIME,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiKey_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Finding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "fixPrompt" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolvedAt" DATETIME,
    "acknowledgedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Finding_runId_fkey" FOREIGN KEY ("runId") REFERENCES "MonitorRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Finding" ("code", "createdAt", "description", "fixPrompt", "id", "runId", "severity", "title") SELECT "code", "createdAt", "description", "fixPrompt", "id", "runId", "severity", "title" FROM "Finding";
DROP TABLE "Finding";
ALTER TABLE "new_Finding" RENAME TO "Finding";
CREATE INDEX "Finding_runId_severity_idx" ON "Finding"("runId", "severity");
CREATE INDEX "Finding_status_idx" ON "Finding"("status");
CREATE TABLE "new_MonitorRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseTimeMs" INTEGER,
    "summary" TEXT NOT NULL,
    "checksRun" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "MonitorRun_appId_fkey" FOREIGN KEY ("appId") REFERENCES "MonitoredApp" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MonitorRun" ("appId", "completedAt", "id", "responseTimeMs", "startedAt", "status", "summary") SELECT "appId", "completedAt", "id", "responseTimeMs", "startedAt", "status", "summary" FROM "MonitorRun";
DROP TABLE "MonitorRun";
ALTER TABLE "new_MonitorRun" RENAME TO "MonitorRun";
CREATE INDEX "MonitorRun_appId_startedAt_idx" ON "MonitorRun"("appId", "startedAt");
CREATE TABLE "new_MonitoredApp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "ownerName" TEXT,
    "criticality" TEXT NOT NULL DEFAULT 'medium',
    "techStack" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "lastCheckedAt" DATETIME,
    "nextCheckAt" DATETIME,
    "uptimePercent" REAL,
    "avgResponseMs" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MonitoredApp_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MonitoredApp" ("createdAt", "criticality", "id", "lastCheckedAt", "name", "nextCheckAt", "ownerEmail", "ownerName", "status", "updatedAt", "url") SELECT "createdAt", "criticality", "id", "lastCheckedAt", "name", "nextCheckAt", "ownerEmail", "ownerName", "status", "updatedAt", "url" FROM "MonitoredApp";
DROP TABLE "MonitoredApp";
ALTER TABLE "new_MonitoredApp" RENAME TO "MonitoredApp";
CREATE INDEX "MonitoredApp_orgId_status_idx" ON "MonitoredApp"("orgId", "status");
CREATE UNIQUE INDEX "MonitoredApp_orgId_url_key" ON "MonitoredApp"("orgId", "url");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeCustomerId_key" ON "Organization"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_orgId_idx" ON "User"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_orgId_key" ON "User"("email", "orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE INDEX "Invite_orgId_idx" ON "Invite"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_orgId_key" ON "Subscription"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "FindingAssignment_findingId_userId_key" ON "FindingAssignment"("findingId", "userId");

-- CreateIndex
CREATE INDEX "AlertConfig_orgId_idx" ON "AlertConfig"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_orgId_idx" ON "ApiKey"("orgId");

-- CreateIndex
CREATE INDEX "AuditLog_orgId_createdAt_idx" ON "AuditLog"("orgId", "createdAt");
