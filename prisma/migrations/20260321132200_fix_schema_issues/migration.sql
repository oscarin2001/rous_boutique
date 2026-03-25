/*
  Warnings:

  - You are about to drop the column `closingTime` on the `BranchSpecialDay` table. All the data in the column will be lost.
  - You are about to drop the column `openingTime` on the `BranchSpecialDay` table. All the data in the column will be lost.

*/
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
    "updatedAt" DATETIME,
    CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Attendance" ("checkIn", "checkOut", "createdAt", "date", "device", "employeeId", "id", "updatedAt") SELECT "checkIn", "checkOut", "createdAt", "date", "device", "employeeId", "id", "updatedAt" FROM "Attendance";
DROP TABLE "Attendance";
ALTER TABLE "new_Attendance" RENAME TO "Attendance";
CREATE TABLE "new_BranchSpecialDay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "branchId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "openingMinutes" INTEGER,
    "closingMinutes" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "BranchSpecialDay_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BranchSpecialDay" ("branchId", "createdAt", "date", "id", "isClosed", "notes", "updatedAt") SELECT "branchId", "createdAt", "date", "id", "isClosed", "notes", "updatedAt" FROM "BranchSpecialDay";
DROP TABLE "BranchSpecialDay";
ALTER TABLE "new_BranchSpecialDay" RENAME TO "BranchSpecialDay";
CREATE UNIQUE INDEX "BranchSpecialDay_branchId_date_key" ON "BranchSpecialDay"("branchId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Trigger to maintain Order.paidTotal consistency with Payment changes
CREATE TRIGGER update_order_paid_total_insert AFTER INSERT ON "Payment"
BEGIN
  UPDATE "Order" SET "paidTotal" = (
    SELECT COALESCE(SUM("amount"), 0) 
    FROM "Payment" 
    WHERE "orderId" = NEW."orderId" AND "status" = 'COMPLETED'
  ) WHERE "id" = NEW."orderId";
END;

CREATE TRIGGER update_order_paid_total_update AFTER UPDATE ON "Payment"
BEGIN
  UPDATE "Order" SET "paidTotal" = (
    SELECT COALESCE(SUM("amount"), 0) 
    FROM "Payment" 
    WHERE "orderId" = NEW."orderId" AND "status" = 'COMPLETED'
  ) WHERE "id" = NEW."orderId";
END;

CREATE TRIGGER update_order_paid_total_delete AFTER DELETE ON "Payment"
BEGIN
  UPDATE "Order" SET "paidTotal" = (
    SELECT COALESCE(SUM("amount"), 0) 
    FROM "Payment" 
    WHERE "orderId" = OLD."orderId" AND "status" = 'COMPLETED'
  ) WHERE "id" = OLD."orderId";
END;

-- Trigger to update Order.status based on paidTotal >= grandTotal
CREATE TRIGGER update_order_status_after_payment AFTER UPDATE ON "Order"
WHEN NEW."paidTotal" >= NEW."grandTotal" AND OLD."status" != 'PAID'
BEGIN
  UPDATE "Order" SET "status" = 'PAID' WHERE "id" = NEW."id";
END;

-- Trigger to validate Cart: must have either customerId or guestToken
CREATE TRIGGER cart_validation_insert BEFORE INSERT ON "Cart"
BEGIN
  SELECT RAISE(ABORT, 'Cart must have either customerId or guestToken') 
  WHERE NEW."customerId" IS NULL AND NEW."guestToken" IS NULL;
END;

CREATE TRIGGER cart_validation_update BEFORE UPDATE ON "Cart"
BEGIN
  SELECT RAISE(ABORT, 'Cart must have either customerId or guestToken') 
  WHERE NEW."customerId" IS NULL AND NEW."guestToken" IS NULL;
END;
