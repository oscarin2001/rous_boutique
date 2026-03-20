"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { verifySessionPassword } from "../helpers/security";
import type { SupplierActionResult } from "../types/supplier";

const DASHBOARD_SUPPLIERS = "/dashboard/suppliers";

export async function toggleSupplierStatusAction(
  id: number,
  currentStatus: boolean
): Promise<SupplierActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "No autorizado" };

    await prisma.supplier.update({ where: { id }, data: { isActive: !currentStatus } });
    await prisma.auditLog.create({
      data: {
        entity: "Supplier",
        entityId: id,
        action: "UPDATE",
        employeeId: session.employeeId,
      },
    });

    revalidatePath(DASHBOARD_SUPPLIERS);
    return { success: true };
  } catch (error) {
    console.error("Error toggling supplier status:", error);
    return { success: false, error: "No se pudo cambiar el estado." };
  }
}

export async function deleteSupplierAction(id: number, confirmPassword: string): Promise<SupplierActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "No autorizado" };

    const validPassword = await verifySessionPassword(session, confirmPassword);
    if (!validPassword) {
      return { success: false, error: "Contrasena de confirmacion invalida" };
    }

    await prisma.supplier.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    await prisma.auditLog.create({
      data: {
        entity: "Supplier",
        entityId: id,
        action: "DELETE",
        employeeId: session.employeeId,
      },
    });

    revalidatePath(DASHBOARD_SUPPLIERS);
    return { success: true };
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return { success: false, error: "No se pudo eliminar el proveedor." };
  }
}
