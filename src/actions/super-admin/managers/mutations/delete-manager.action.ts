"use server";

import { revalidatePath } from "next/cache";

import type { ManagerActionResult } from "@/actions/super-admin/managers/types";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { createManagerAuditLog } from "../helpers/audit";
import { verifySessionPassword } from "../helpers/security";

export async function deleteManager(id: number, confirmPassword: string): Promise<ManagerActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "No autorizado" };

  const validPassword = await verifySessionPassword(session, confirmPassword);
  if (!validPassword) {
    return { success: false, error: "Contraseña de confirmación inválida" };
  }

  const existing = await prisma.employee.findUnique({
    where: { id },
    include: {
      role: { select: { code: true } },
      auth: { select: { id: true, username: true } },
      employeeBranches: { select: { branchId: true } },
    },
  });

  if (!existing || existing.role.code !== "MANAGER" || existing.deletedAt) {
    return { success: false, error: "Encargado no encontrado" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.employeeBranch.deleteMany({ where: { employeeId: id } });

    await tx.employee.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "INACTIVE",
        updatedById: session.employeeId,
      },
    });

    await tx.auth.update({
      where: { id: existing.auth.id },
      data: { isActive: false },
    });

    await createManagerAuditLog(tx, {
      entityId: id,
      action: "DELETE",
      employeeId: session.employeeId,
      oldValue: {
        firstName: existing.firstName,
        lastName: existing.lastName,
        ci: existing.ci,
        email: existing.auth.username,
        branchIds: existing.employeeBranches.map((item) => item.branchId),
      },
    });
  });

  revalidatePath("/dashboard/managers");
  revalidatePath("/dashboard/branches");
  return { success: true };
}

