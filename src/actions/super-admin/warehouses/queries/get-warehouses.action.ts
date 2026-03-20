"use server";

import { prisma } from "@/lib/prisma";

import { serializeWarehouse } from "../helpers/shared";
import type { WarehouseRow } from "../types/warehouse";

async function getWarehouseAuditNames(warehouseIds: number[]) {
  const map = new Map<number, { createdByName: string | null; updatedByName: string | null }>();
  if (warehouseIds.length === 0) return map;

  const logs = await prisma.auditLog.findMany({
    where: {
      entity: "Warehouse",
      entityId: { in: warehouseIds },
      action: { in: ["CREATE", "UPDATE"] },
    },
    include: { employee: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });

  for (const log of logs) {
    const current = map.get(log.entityId) ?? { createdByName: null, updatedByName: null };
    const actorName = log.employee ? `${log.employee.firstName} ${log.employee.lastName}` : null;

    if (log.action === "UPDATE" && current.updatedByName === null) {
      current.updatedByName = actorName;
    }

    if (log.action === "CREATE" && current.createdByName === null) {
      current.createdByName = actorName;
    }

    map.set(log.entityId, current);
  }

  return map;
}

export async function getWarehouses(): Promise<WarehouseRow[]> {
  const rows = await prisma.warehouse.findMany({
    include: {
      managers: {
        include: { employee: { select: { id: true, firstName: true, lastName: true, ci: true } } },
        orderBy: { assignedAt: "asc" },
      },
      warehouseBranches: {
        include: { branch: { select: { id: true, name: true, city: true } } },
        orderBy: { assignedAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const auditMap = await getWarehouseAuditNames(rows.map((row) => row.id));

  return rows.map((row) => {
    const serialized = serializeWarehouse(row);
    const audit = auditMap.get(row.id);
    return {
      ...serialized,
      createdByName: audit?.createdByName ?? null,
      updatedByName: audit?.updatedByName ?? null,
    };
  });
}
