"use server";

import bcrypt from "bcryptjs";

import { parseIsoDate } from "@/lib/field-validation";
import { prisma } from "@/lib/prisma";

import {
  ensureSuperAdminActor,
  getSuperAdminById,
  mapSuperAdminRow,
  verifyActorPassword,
} from "../helpers";
import { updateSuperAdminSchema } from "../schemas";
import type { SuperAdminActionResult } from "../types";

export async function updateSuperAdmin(id: number, input: unknown): Promise<SuperAdminActionResult> {
  const session = await ensureSuperAdminActor();
  if (!session) return { success: false, error: "No autorizado" };

  const parsed = updateSuperAdminSchema.safeParse(input);
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

  const birthDate = parseIsoDate(parsed.data.birthDate);
  if (!birthDate) return { success: false, fieldErrors: { birthDate: "Fecha invalida" } };

  if (parsed.data.username !== existing.auth.username) {
    const usernameExists = await prisma.auth.findUnique({
      where: { username: parsed.data.username },
      select: { id: true },
    });
    if (usernameExists && usernameExists.id !== existing.authId) {
      return { success: false, fieldErrors: { username: "El usuario ya existe" } };
    }
  }

  if (parsed.data.ci !== existing.ci) {
    const ciExists = await prisma.employee.findFirst({
      where: { ci: parsed.data.ci, id: { not: existing.id } },
      select: { id: true },
    });
    if (ciExists) return { success: false, fieldErrors: { ci: "La CI ya existe" } };
  }

  const passwordChanged = Boolean(parsed.data.newPassword);
  const nextPasswordHash = passwordChanged ? await bcrypt.hash(parsed.data.newPassword as string, 12) : null;

  await prisma.$transaction(async (tx) => {
    await tx.employee.update({
      where: { id: existing.id },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        ci: parsed.data.ci,
        phone: parsed.data.phone || null,
        updatedById: session.employeeId,
      },
    });

    await tx.employeeProfile.upsert({
      where: { employeeId: existing.id },
      update: { birthDate },
      create: { employeeId: existing.id, birthDate },
    });

    await tx.auth.update({
      where: { id: existing.authId },
      data: {
        username: parsed.data.username,
        password: nextPasswordHash ?? undefined,
      },
    });

    await tx.auditLog.create({
      data: {
        entity: "SuperAdminAccountUpdate",
        entityId: existing.id,
        action: "UPDATE",
        employeeId: session.employeeId,
        oldValue: JSON.stringify({
          firstName: existing.firstName,
          lastName: existing.lastName,
          username: existing.auth.username,
          ci: existing.ci,
          phone: existing.phone,
          birthDate: existing.employeeProfile?.birthDate?.toISOString().slice(0, 10) ?? null,
        }),
        newValue: JSON.stringify({
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          username: parsed.data.username,
          ci: parsed.data.ci,
          phone: parsed.data.phone || null,
          birthDate: parsed.data.birthDate,
          passwordChanged,
        }),
      },
    });
  });

  const updated = await getSuperAdminById(id);
  if (!updated) return { success: false, error: "No se pudo recuperar el registro actualizado" };
  return { success: true, superAdmin: mapSuperAdminRow(updated) };
}
