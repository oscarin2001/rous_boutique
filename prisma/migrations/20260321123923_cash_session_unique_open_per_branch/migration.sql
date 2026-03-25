-- AlterTable
ALTER TABLE "Employee" ADD COLUMN "aboutMe" TEXT;
ALTER TABLE "Employee" ADD COLUMN "languages" TEXT;
ALTER TABLE "Employee" ADD COLUMN "photoUrl" TEXT;
ALTER TABLE "Employee" ADD COLUMN "profession" TEXT;
ALTER TABLE "Employee" ADD COLUMN "skills" TEXT;

-- CreateTable
CREATE TABLE "EmployeeSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/La_Paz',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT '24h',
    "currency" TEXT NOT NULL DEFAULT 'BOB',
    "sessionTtlMinutes" INTEGER NOT NULL DEFAULT 480,
    "emergencyPhone" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "signatureDisplayName" TEXT,
    "signatureTitle" TEXT,
    "notifyOnLogin" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnCreate" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnUpdate" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnDelete" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnSecurity" BOOLEAN NOT NULL DEFAULT true,
    "notificationLastReadAt" DATETIME,
    "notificationDismissedIds" TEXT,
    "notificationReadIds" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "EmployeeSettings_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "authId" INTEGER NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    CONSTRAINT "AuthSession_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSettings_employeeId_key" ON "EmployeeSettings"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_sessionId_key" ON "AuthSession"("sessionId");

-- CreateIndex
CREATE INDEX "AuthSession_authId_idx" ON "AuthSession"("authId");

-- CreateIndex
CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");
