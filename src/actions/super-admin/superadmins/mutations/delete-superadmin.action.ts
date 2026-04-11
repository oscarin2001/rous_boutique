"use server";

import { prisma } from "@/lib/prisma";

import {
  countActiveSuperAdmins,
  ensureSuperAdminActor,
  getSuperAdminById,
  verifyActorPassword,
} from "../helpers";
import { superAdminAdminConfirmSchema } from "../schemas";
import type { SuperAdminActionResult } from "../types";

export async function deleteSuperAdmin(id: number, input: unknown): Promise<SuperAdminActionResult> {
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
  if (existing.id === session.employeeId) return { success: false, error: "No puedes eliminar tu propia cuenta" };

  const remaining = await countActiveSuperAdmins(existing.id);
  if (remaining < 1) return { success: false, error: "Debe existir al menos un super admin activo" };

  await prisma.$transaction(async (tx) => {
    await tx.employee.update({
      where: { id: existing.id },
      data: {
        status: "DEACTIVATED",
        deletedAt: new Date(),
        updatedById: session.employeeId,
      },
    });

    await tx.auth.update({
      where: { id: existing.authId },
      data: { isActive: false },
    });

    await tx.authSession.updateMany({
      where: { authId: existing.authId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await tx.auditLog.create({
      data: {
        entity: "SuperAdminAccountDelete",
        entityId: existing.id,
        action: "DELETE",
        employeeId: session.employeeId,
        oldValue: JSON.stringify({
          firstName: existing.firstName,
          lastName: existing.lastName,
          username: existing.auth.username,
          status: existing.status,
        }),
        newValue: JSON.stringify({ deletedAt: new Date().toISOString() }),
      },
    });
  });

  return { success: true };
}
