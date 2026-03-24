"use server";

import { revalidatePath } from "next/cache";

import type { ManagerActionResult } from "@/actions/super-admin/managers/types";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { createManagerAuditLog } from "../helpers/audit";
import {
  enforceAdminPasswordCheck,
  enforceSensitiveActionRateLimit,
} from "../helpers/security-hardening";
import { serializeManager } from "../helpers/shared";

export async function toggleManagerStatus(
  id: number,
  adminConfirmPassword: string,
  expectedCurrentStatus?: "ACTIVE" | "DEACTIVATED" | "INACTIVE",
  reason?: string
): Promise<ManagerActionResult> {
  const session = await getSession();
  if (!session || session.roleCode !== "SUPERADMIN") return { success: false, error: "No autorizado" };

  const rateLimitError = enforceSensitiveActionRateLimit(session);
  if (rateLimitError) {
    return { success: false, error: rateLimitError };
  }

  const passwordError = await enforceAdminPasswordCheck(session, adminConfirmPassword, true);
  if (passwordError) {
    return {
      success: false,
      error: passwordError,
      fieldErrors: {
        adminConfirmPassword: passwordError,
      },
    };
  }

  const sanitizedReason = (reason ?? "").trim();
  if (sanitizedReason.length < 10) {
    return {
      success: false,
      error: "El motivo debe tener al menos 10 caracteres",
      fieldErrors: { statusReason: "El motivo debe tener al menos 10 caracteres" },
    };
  }
  if (sanitizedReason.length > 160) {
    return {
      success: false,
      error: "El motivo no puede exceder 160 caracteres",
      fieldErrors: { statusReason: "El motivo no puede exceder 160 caracteres" },
    };
  }

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

  if (existing.id === session.employeeId) {
    return { success: false, error: "No puedes cambiar tu propio estado" };
  }

  if (existing.status === "INACTIVE") {
    return { success: false, error: "No se puede cambiar el estado de un encargado inactivo" };
  }

  if (expectedCurrentStatus && existing.status !== expectedCurrentStatus) {
    return { success: false, error: "El estado ya fue modificado. Recarga e intenta nuevamente" };
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
      newValue: { status: nextStatus, statusReason: sanitizedReason },
    });

    return tx.employee.findUniqueOrThrow({
      where: { id },
      include: {
        role: { select: { code: true } },
        auth: { select: { username: true, isActive: true } },
        employeeProfile: { select: { birthDate: true, homeAddress: true } },
        employeeEmployment: { select: { salary: true, contributionType: true, hireDate: true } },
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

