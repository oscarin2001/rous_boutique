"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { verifySessionPassword } from "../helpers/security";
import { serializeWarehouse } from "../helpers/shared";
import { updateWarehouseSchema } from "../schemas/warehouse.schema";
import type { WarehouseActionResult, WarehouseFormField } from "../types/warehouse";

const FIELDS: WarehouseFormField[] = ["name", "phone", "address", "city", "department", "country", "openedAt", "branchIds", "managerIds", "confirmPassword"];

export async function updateWarehouse(id: number, data: Record<string, unknown>): Promise<WarehouseActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "No autorizado" };

  const parsed = updateWarehouseSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<WarehouseFormField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "");
      if (FIELDS.includes(field as WarehouseFormField) && !fieldErrors[field as WarehouseFormField]) fieldErrors[field as WarehouseFormField] = issue.message;
    }
    return { success: false, error: parsed.error.issues[0]?.message, fieldErrors };
  }

  const validPassword = await verifySessionPassword(session, parsed.data.confirmPassword);
  if (!validPassword) return { success: false, error: "Contrasena invalida", fieldErrors: { confirmPassword: "Contrasena invalida" } };

  const updated = await prisma.$transaction(async (tx) => {
    await tx.warehouse.update({
      where: { id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        address: parsed.data.address,
        city: parsed.data.city,
        department: parsed.data.department || null,
        country: parsed.data.country,
        openedAt: parsed.data.openedAt,
      },
    });

    await tx.warehouseBranch.deleteMany({ where: { warehouseId: id } });
    if (parsed.data.branchIds.length) {
      await tx.warehouseBranch.createMany({ data: parsed.data.branchIds.map((branchId) => ({ warehouseId: id, branchId })) });
    }

    await tx.warehouseManager.deleteMany({ where: { warehouseId: id } });
    if (parsed.data.managerIds.length) {
      await tx.warehouseManager.createMany({ data: parsed.data.managerIds.map((employeeId) => ({ warehouseId: id, employeeId })) });
    }

    await tx.auditLog.create({ data: { entity: "Warehouse", entityId: id, action: "UPDATE", employeeId: session.employeeId } });

    return tx.warehouse.findUniqueOrThrow({
      where: { id },
      include: {
        managers: { include: { employee: { select: { id: true, firstName: true, lastName: true, ci: true } } } },
        warehouseBranches: { include: { branch: { select: { id: true, name: true, city: true } } } },
      },
    });
  });

  revalidatePath("/dashboard/warehouses");
  return { success: true, warehouse: serializeWarehouse(updated) };
}
