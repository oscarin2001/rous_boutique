"use server";

import type { ManagerAuditEntry } from "@/actions/super-admin/managers/types";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getManagerHistory(managerId: number): Promise<ManagerAuditEntry[]> {
  const session = await getSession();
  if (!session) return [];

  const logs = await prisma.auditLog.findMany({
    where: {
      entity: "Manager",
      entityId: managerId,
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    createdAt: log.createdAt.toISOString(),
    employeeName: log.employee ? `${log.employee.firstName} ${log.employee.lastName}` : null,
    oldValue: log.oldValue,
    newValue: log.newValue,
  }));
}

