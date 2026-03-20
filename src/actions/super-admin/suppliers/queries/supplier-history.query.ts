"use server";

import { prisma } from "@/lib/prisma";

import type { SupplierHistoryRow } from "../types/supplier";

export async function getSupplierHistory(id: number): Promise<SupplierHistoryRow[]> {
  const rows = await prisma.auditLog.findMany({
    where: { entity: "Supplier", entityId: id },
    include: { employee: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return rows.map((row) => ({
    id: row.id,
    action: row.action === "UPDATE" ? "UPDATE" : row.action,
    entity: row.entity,
    oldValue: row.oldValue,
    newValue: row.newValue,
    employeeName: row.employee
      ? `${row.employee.firstName} ${row.employee.lastName}`
      : null,
    createdAt: row.createdAt.toISOString(),
  }));
}
