/*
  Warnings:

  - You are about to drop the column `aboutMe` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `contractEndAt` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `contractType` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `contributionType` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `hireDate` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `homeAddress` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `notifications` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `profession` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `Employee` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "EmployeeProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "birthDate" DATETIME,
    "profession" TEXT,
    "aboutMe" TEXT,
    "photoUrl" TEXT,
    "homeAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeeProfile_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeeEmployment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "salary" DECIMAL NOT NULL DEFAULT 0,
    "hireDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contractEndAt" DATETIME,
    "contractType" TEXT NOT NULL DEFAULT 'INDEFINITE',
    "contributionType" TEXT NOT NULL DEFAULT 'NONE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeeEmployment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Migrate data to new tables
INSERT INTO "EmployeeProfile" ("employeeId", "birthDate", "profession", "aboutMe", "photoUrl", "homeAddress", "createdAt", "updatedAt")
SELECT "id", "birthDate", "profession", "aboutMe", "photoUrl", "homeAddress", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Employee"
WHERE "birthDate" IS NOT NULL OR "profession" IS NOT NULL OR "aboutMe" IS NOT NULL OR "photoUrl" IS NOT NULL OR "homeAddress" IS NOT NULL;

INSERT INTO "EmployeeEmployment" ("employeeId", "salary", "hireDate", "contractEndAt", "contractType", "contributionType", "createdAt", "updatedAt")
SELECT "id", "salary", "hireDate", "contractEndAt", "contractType", "contributionType", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Employee";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "authId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "branchId" INTEGER,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "ci" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "deletedAt" DATETIME,
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
INSERT INTO "new_Employee" ("authId", "branchId", "ci", "createdAt", "createdById", "deletedAt", "firstName", "id", "lastName", "phone", "roleId", "status", "updatedAt", "updatedById") SELECT "authId", "branchId", "ci", "createdAt", "createdById", "deletedAt", "firstName", "id", "lastName", "phone", "roleId", "status", "updatedAt", "updatedById" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_authId_key" ON "Employee"("authId");
CREATE UNIQUE INDEX "Employee_ci_key" ON "Employee"("ci");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProfile_employeeId_key" ON "EmployeeProfile"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeEmployment_employeeId_key" ON "EmployeeEmployment"("employeeId");
