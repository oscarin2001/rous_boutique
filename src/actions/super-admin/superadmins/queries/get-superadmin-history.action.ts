"use server";

import { prisma } from "@/lib/prisma";

import { ensureSuperAdminActor } from "../helpers";
import type { SuperAdminAuditEntry } from "../types";

const historyEntities = [
  "SuperAdminAccount",
  "SuperAdminAccountUpdate",
  "SuperAdminAccountStatus",
  "SuperAdminAccountDelete",
] as const;

export async function getSuperAdminHistory(superAdminId: number): Promise<SuperAdminAuditEntry[]> {
  const session = await ensureSuperAdminActor();
  if (!session) return [];

  const logs = await prisma.auditLog.findMany({
    where: {
      entityId: superAdminId,
      entity: { in: [...historyEntities] },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    select: {
      id: true,
      entity: true,
      action: true,
      createdAt: true,
      oldValue: true,
      newValue: true,
      employee: { select: { firstName: true, lastName: true } },
    },
  });

  return logs.map((log) => ({
    id: log.id,
    entity: log.entity,
    action: log.action,
    createdAt: log.createdAt.toISOString(),
    oldValue: log.oldValue,
    newValue: log.newValue,
    employeeName: log.employee ? `${log.employee.firstName} ${log.employee.lastName}` : null,
  }));
}
