"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { verifySessionPassword } from "../helpers/security";
import type { WarehouseActionResult } from "../types/warehouse";

export async function deleteWarehouse(id: number, confirmPassword: string): Promise<WarehouseActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "No autorizado" };

  const validPassword = await verifySessionPassword(session, confirmPassword);
  if (!validPassword) return { success: false, error: "Contrasena invalida" };

  const exists = await prisma.warehouse.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return { success: false, error: "Bodega no encontrada" };

  await prisma.$transaction(async (tx) => {
    await tx.warehouseManager.deleteMany({ where: { warehouseId: id } });
    await tx.warehouseBranch.deleteMany({ where: { warehouseId: id } });
    await tx.warehouse.delete({ where: { id } });
    await tx.auditLog.create({ data: { entity: "Warehouse", entityId: id, action: "DELETE", employeeId: session.employeeId } });
  });

  revalidatePath("/dashboard/warehouses");
  return { success: true };
}
