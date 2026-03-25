-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmployeeSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'SYSTEM',
    "language" TEXT NOT NULL DEFAULT 'es',
    "notifications" BOOLEAN NOT NULL DEFAULT true,
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
INSERT INTO "new_EmployeeSettings" ("createdAt", "currency", "dateFormat", "emergencyContactName", "emergencyContactPhone", "emergencyPhone", "employeeId", "id", "notificationDismissedIds", "notificationLastReadAt", "notificationReadIds", "notifyOnCreate", "notifyOnDelete", "notifyOnLogin", "notifyOnSecurity", "notifyOnUpdate", "sessionTtlMinutes", "signatureDisplayName", "signatureTitle", "timeFormat", "timezone", "updatedAt") SELECT "createdAt", "currency", "dateFormat", "emergencyContactName", "emergencyContactPhone", "emergencyPhone", "employeeId", "id", "notificationDismissedIds", "notificationLastReadAt", "notificationReadIds", "notifyOnCreate", "notifyOnDelete", "notifyOnLogin", "notifyOnSecurity", "notifyOnUpdate", "sessionTtlMinutes", "signatureDisplayName", "signatureTitle", "timeFormat", "timezone", "updatedAt" FROM "EmployeeSettings";
DROP TABLE "EmployeeSettings";
ALTER TABLE "new_EmployeeSettings" RENAME TO "EmployeeSettings";
CREATE UNIQUE INDEX "EmployeeSettings_employeeId_key" ON "EmployeeSettings"("employeeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
