/*
  Warnings:

  - You are about to drop the column `latitude` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Branch` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Branch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nit" TEXT,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "department" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Bolivia',
    "googleMaps" TEXT,
    "openedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);
INSERT INTO "new_Branch" ("address", "city", "country", "createdAt", "department", "id", "name", "nit", "openedAt", "phone", "updatedAt") SELECT "address", "city", "country", "createdAt", "department", "id", "name", "nit", "openedAt", "phone", "updatedAt" FROM "Branch";
DROP TABLE "Branch";
ALTER TABLE "new_Branch" RENAME TO "Branch";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
