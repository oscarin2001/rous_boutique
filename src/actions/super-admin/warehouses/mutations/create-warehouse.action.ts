"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { serializeWarehouse } from "../helpers/shared";
import { createWarehouseSchema } from "../schemas/warehouse.schema";
import type { WarehouseActionResult, WarehouseFormField } from "../types/warehouse";

const FIELDS: WarehouseFormField[] = ["name", "phone", "address", "city", "department", "country", "openedAt", "branchIds", "managerIds"];

export async function createWarehouse(data: Record<string, unknown>): Promise<WarehouseActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "No autorizado" };

  const parsed = createWarehouseSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<WarehouseFormField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "");
      if (FIELDS.includes(field as WarehouseFormField) && !fieldErrors[field as WarehouseFormField]) fieldErrors[field as WarehouseFormField] = issue.message;
    }
    return { success: false, error: parsed.error.issues[0]?.message, fieldErrors };
  }

  const payload = parsed.data;
  const created = await prisma.$transaction(async (tx) => {
    const warehouse = await tx.warehouse.create({
      data: {
        name: payload.name,
        phone: payload.phone || null,
        address: payload.address,
        city: payload.city,
        department: payload.department || null,
        country: payload.country,
        openedAt: payload.openedAt,
      },
    });

    if (payload.branchIds.length) {
      await tx.warehouseBranch.createMany({ data: payload.branchIds.map((branchId) => ({ warehouseId: warehouse.id, branchId })) });
    }

    if (payload.managerIds.length) {
      await tx.warehouseManager.createMany({ data: payload.managerIds.map((employeeId) => ({ warehouseId: warehouse.id, employeeId })) });
    }

    await tx.auditLog.create({ data: { entity: "Warehouse", entityId: warehouse.id, action: "CREATE", employeeId: session.employeeId } });

    return tx.warehouse.findUniqueOrThrow({
      where: { id: warehouse.id },
      include: {
        managers: { include: { employee: { select: { id: true, firstName: true, lastName: true, ci: true } } } },
        warehouseBranches: { include: { branch: { select: { id: true, name: true, city: true } } } },
      },
    });
  });

  revalidatePath("/dashboard/warehouses");
  return { success: true, warehouse: serializeWarehouse(created) };
}
