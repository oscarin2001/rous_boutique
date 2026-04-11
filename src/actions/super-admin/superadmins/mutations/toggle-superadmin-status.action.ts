"use server";

import { prisma } from "@/lib/prisma";

import {
  countActiveSuperAdmins,
  ensureSuperAdminActor,
  getSuperAdminById,
  mapSuperAdminRow,
  verifyActorPassword,
} from "../helpers";
import { superAdminAdminConfirmSchema } from "../schemas";
import type { SuperAdminActionResult } from "../types";

export async function toggleSuperAdminStatus(id: number, input: unknown): Promise<SuperAdminActionResult> {
  const session = await ensureSuperAdminActor();
  if (!session) return { success: false, error: "No autorizado" };

  const parsed = superAdminAdminConfirmSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const isValidPassword = await verifyActorPassword(session.authId, parsed.data.adminConfirmPassword);
  if (!isValidPassword) {
    return { success: false, fieldErrors: { adminConfirmPassword: "La contrasena actual es incorrecta" } };
  }

  const existing = await getSuperAdminById(id);
  if (!existing) return { success: false, error: "Super admin no encontrado" };
  if (existing.id === session.employeeId) {
    return { success: false, error: "No puedes cambiar el estado de tu propia cuenta desde este modulo" };
  }

  const nextStatus = existing.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";
  if (nextStatus !== "ACTIVE") {
    const remaining = await countActiveSuperAdmins(existing.id);
    if (remaining < 1) {
      return { success: false, error: "Debe existir al menos un super admin activo" };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.employee.update({
      where: { id: existing.id },
      data: {
        status: nextStatus,
        updatedById: session.employeeId,
      },
    });

    await tx.auth.update({
      where: { id: existing.authId },
      data: { isActive: nextStatus === "ACTIVE" },
    });

    await tx.auditLog.create({
      data: {
        entity: "SuperAdminAccountStatus",
        entityId: existing.id,
        action: "UPDATE",
        employeeId: session.employeeId,
        oldValue: JSON.stringify({ status: existing.status }),
        newValue: JSON.stringify({ status: nextStatus, reason: parsed.data.statusReason || null }),
      },
    });
  });

  const updated = await getSuperAdminById(id);
  if (!updated) return { success: false, error: "No se pudo recuperar el registro actualizado" };
  return { success: true, superAdmin: mapSuperAdminRow(updated) };
}
