/*
  Warnings:

  - You are about to alter the column `date` on the `Attendance` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - You are about to drop the column `closingTime` on the `BranchHour` table. All the data in the column will be lost.
  - You are about to drop the column `openingTime` on the `BranchHour` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `Employee` table. All the data in the column will be lost.
  - You are about to alter the column `endTime` on the `ShiftSchedule` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - You are about to alter the column `startTime` on the `ShiftSchedule` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.

*/
-- CreateTable
CREATE TABLE "EmployeeSkill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmployeeSkill_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeeLanguage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "level" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmployeeLanguage_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME,
    "device" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Attendance" ("checkIn", "checkOut", "createdAt", "date", "device", "employeeId", "id", "updatedAt") SELECT "checkIn", "checkOut", "createdAt", "date", "device", "employeeId", "id", "updatedAt" FROM "Attendance";
DROP TABLE "Attendance";
ALTER TABLE "new_Attendance" RENAME TO "Attendance";
CREATE TABLE "new_BranchHour" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "branchId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openingMinutes" INTEGER,
    "closingMinutes" INTEGER,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "BranchHour_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BranchHour" ("branchId", "createdAt", "dayOfWeek", "id", "isClosed", "updatedAt") SELECT "branchId", "createdAt", "dayOfWeek", "id", "isClosed", "updatedAt" FROM "BranchHour";
DROP TABLE "BranchHour";
ALTER TABLE "new_BranchHour" RENAME TO "BranchHour";
CREATE UNIQUE INDEX "BranchHour_branchId_dayOfWeek_key" ON "BranchHour"("branchId", "dayOfWeek");
CREATE TABLE "new_Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "authId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "branchId" INTEGER,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "ci" TEXT NOT NULL,
    "phone" TEXT,
    "birthDate" DATETIME,
    "profession" TEXT,
    "aboutMe" TEXT,
    "photoUrl" TEXT,
    "salary" DECIMAL NOT NULL DEFAULT 0,
    "hireDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contractEndAt" DATETIME,
    "contractType" TEXT NOT NULL DEFAULT 'INDEFINITE',
    "contributionType" TEXT NOT NULL DEFAULT 'NONE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "homeAddress" TEXT,
    "deletedAt" DATETIME,
    "theme" TEXT NOT NULL DEFAULT 'SYSTEM',
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT NOT NULL DEFAULT 'es',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    CONSTRAINT "Employee_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Employee_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("aboutMe", "authId", "birthDate", "branchId", "ci", "contractEndAt", "contractType", "contributionType", "createdAt", "createdById", "deletedAt", "firstName", "hireDate", "homeAddress", "id", "language", "lastName", "notifications", "phone", "photoUrl", "profession", "roleId", "salary", "status", "theme", "updatedAt", "updatedById") SELECT "aboutMe", "authId", "birthDate", "branchId", "ci", "contractEndAt", "contractType", "contributionType", "createdAt", "createdById", "deletedAt", "firstName", "hireDate", "homeAddress", "id", "language", "lastName", "notifications", "phone", "photoUrl", "profession", "roleId", "salary", "status", "theme", "updatedAt", "updatedById" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_authId_key" ON "Employee"("authId");
CREATE UNIQUE INDEX "Employee_ci_key" ON "Employee"("ci");
CREATE TABLE "new_ShiftSchedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "shiftType" TEXT NOT NULL DEFAULT 'NORMAL',
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "ShiftSchedule_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ShiftSchedule_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ShiftSchedule" ("branchId", "createdAt", "date", "employeeId", "endTime", "id", "isHoliday", "notes", "shiftType", "startTime", "updatedAt") SELECT "branchId", "createdAt", "date", "employeeId", "endTime", "id", "isHoliday", "notes", "shiftType", "startTime", "updatedAt" FROM "ShiftSchedule";
DROP TABLE "ShiftSchedule";
ALTER TABLE "new_ShiftSchedule" RENAME TO "ShiftSchedule";
CREATE UNIQUE INDEX "ShiftSchedule_employeeId_date_key" ON "ShiftSchedule"("employeeId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "EmployeeSkill_employeeId_idx" ON "EmployeeSkill"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeLanguage_employeeId_idx" ON "EmployeeLanguage"("employeeId");
