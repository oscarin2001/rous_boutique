-- Enforce unique open cash session per branch
CREATE UNIQUE INDEX cashsession_one_open_per_branch
ON "CashSession" ("branchId")
WHERE "status" = 'OPEN';