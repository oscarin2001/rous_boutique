import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export async function createManagerAuditLog(
  db: DbClient,
  params: {
    entityId: number;
    action: "CREATE" | "UPDATE" | "DELETE";
    employeeId?: number;
    oldValue?: unknown;
    newValue?: unknown;
  }
) {
  await db.auditLog.create({
    data: {
      entity: "Manager",
      entityId: params.entityId,
      action: params.action,
      employeeId: params.employeeId,
      oldValue:
        params.oldValue === undefined ? null : JSON.stringify(params.oldValue),
      newValue:
        params.newValue === undefined ? null : JSON.stringify(params.newValue),
    },
  });
}
