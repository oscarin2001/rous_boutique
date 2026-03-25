/*
  Warnings:

  - A unique constraint covering the columns `[branchId,date]` on the table `BranchSpecialDay` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BranchSpecialDay_branchId_date_key" ON "BranchSpecialDay"("branchId", "date");
