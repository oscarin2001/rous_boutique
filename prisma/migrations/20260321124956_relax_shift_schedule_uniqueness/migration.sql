/*
  Warnings:

  - A unique constraint covering the columns `[employeeId,date,startTime]` on the table `ShiftSchedule` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ShiftSchedule_employeeId_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "ShiftSchedule_employeeId_date_startTime_key" ON "ShiftSchedule"("employeeId", "date", "startTime");
