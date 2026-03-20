"use server";

import { revalidatePath } from "next/cache";

import type { ManagerActionResult } from "@/actions/super-admin/managers/types";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { createManagerAuditLog } from "../helpers/audit";
import { serializeManager } from "../helpers/shared";

export async function toggleManagerStatus(id: number): Promise<ManagerActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "No autorizado" };

  const existing = await prisma.employee.findUnique({
    where: { id },
    include: {
      role: { select: { code: true } },
      auth: { select: { id: true, username: true, isActive: true } },
      employeeBranches: {
        select: { branch: { select: { id: true, name: true, city: true } } },
      },
    },
  });

  if (!existing || existing.role.code !== "MANAGER" || existing.deletedAt) {
    return { success: false, error: "Encargado no encontrado" };
  }

  if (existing.status === "INACTIVE") {
    return { success: false, error: "No se puede cambiar el estado de un encargado inactivo" };
  }

  const nextStatus = existing.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";

  const manager = await prisma.$transaction(async (tx) => {
    await tx.employee.update({
      where: { id },
      data: {
        status: nextStatus,
        updatedById: session.employeeId,
      },
    });

    await tx.auth.update({
      where: { id: existing.auth.id },
      data: { isActive: nextStatus === "ACTIVE" },
    });

    await createManagerAuditLog(tx, {
      entityId: id,
      action: "UPDATE",
      employeeId: session.employeeId,
      oldValue: { status: existing.status },
      newValue: { status: nextStatus },
    });

    return tx.employee.findUniqueOrThrow({
      where: { id },
      include: {
        role: { select: { code: true } },
        auth: { select: { username: true, isActive: true } },
        createdBy: { select: { firstName: true, lastName: true } },
        updatedBy: { select: { firstName: true, lastName: true } },
        employeeBranches: {
          select: { branch: { select: { id: true, name: true, city: true } } },
          orderBy: { assignedAt: "asc" },
        },
      },
    });
  });

  revalidatePath("/dashboard/managers");
  return { success: true, manager: serializeManager(manager) };
}

