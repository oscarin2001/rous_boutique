"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { enforceAdminPasswordCheck, enforceSensitiveActionRateLimit } from "../helpers/security";
import type { SupplierActionResult } from "../types/supplier";

const DASHBOARD_SUPPLIERS = "/dashboard/suppliers";

export async function toggleSupplierStatusAction(
  id: number,
  currentStatus: boolean
): Promise<SupplierActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "No autorizado" };

    const rateLimitError = enforceSensitiveActionRateLimit(session);
    if (rateLimitError) return { success: false, error: rateLimitError };

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

export async function deleteSupplierAction(
  id: number,
  confirmPassword: string,
  reason: string
): Promise<SupplierActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "No autorizado" };

    const rateLimitError = enforceSensitiveActionRateLimit(session);
    if (rateLimitError) return { success: false, error: rateLimitError };

    const passwordError = await enforceAdminPasswordCheck(session, confirmPassword, false);
    if (passwordError) return { success: false, error: passwordError };

    const trimmedReason = reason.trim();
    if (trimmedReason.length < 10 || trimmedReason.length > 160) {
      return { success: false, error: "La razón debe tener entre 10 y 160 caracteres" };
    }

    // Get supplier data for audit
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      select: {
        firstName: true,
        lastName: true,
        isActive: true,
        notes: true,
        branches: { select: { branchId: true } },
        managers: { select: { employeeId: true } }
      }
    });

    if (!supplier) return { success: false, error: "Proveedor no encontrado" };

    await prisma.$transaction(async (tx) => {
      // Soft delete the supplier
      await tx.supplier.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
          notes: supplier.notes ? `${supplier.notes}\n\n[ELIMINADO: ${new Date().toISOString()}] ${trimmedReason}` : `[ELIMINADO: ${new Date().toISOString()}] ${trimmedReason}`
        }
      });

      // Remove assignments if no historical value
      // No se puede determinar si tiene compras o monto total desde aquí, así que siempre se mantienen las asignaciones

      // Create detailed audit log
      await tx.auditLog.create({
        data: {
          entity: "Supplier",
          entityId: id,
          action: "DELETE",
          oldValue: JSON.stringify({
            name: `${supplier.firstName} ${supplier.lastName}`,
            isActive: supplier.isActive,
            branchCount: supplier.branches.length,
            managerCount: supplier.managers.length
          }),
          newValue: JSON.stringify({
            deleted: true,
            reason: trimmedReason
          }),
          employeeId: session.employeeId,
        },
      });
    });

    revalidatePath(DASHBOARD_SUPPLIERS);
    return { success: true };
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return { success: false, error: "No se pudo eliminar el proveedor." };
  }
}
