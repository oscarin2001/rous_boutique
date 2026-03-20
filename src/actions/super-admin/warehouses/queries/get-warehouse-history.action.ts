"use server";

import { prisma } from "@/lib/prisma";

import type { WarehouseHistoryRow } from "../types/warehouse";

export async function getWarehouseHistory(id: number): Promise<WarehouseHistoryRow[]> {
  const logs = await prisma.auditLog.findMany({
    where: { entity: "Warehouse", entityId: id },
    include: { employee: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    actorName: log.employee ? `${log.employee.firstName} ${log.employee.lastName}` : "Sistema",
    createdAt: log.createdAt.toISOString(),
  }));
}
