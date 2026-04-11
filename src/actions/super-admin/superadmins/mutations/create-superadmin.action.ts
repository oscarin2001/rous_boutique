"use server";

import bcrypt from "bcryptjs";

import { parseIsoDate } from "@/lib/field-validation";
import { prisma } from "@/lib/prisma";

import {
  ensureSuperAdminActor,
  getSuperAdminById,
  getSuperAdminRoleId,
  mapSuperAdminRow,
  verifyActorPassword,
} from "../helpers";
import { createSuperAdminSchema } from "../schemas";
import type { SuperAdminActionResult } from "../types";

export async function createSuperAdmin(input: unknown): Promise<SuperAdminActionResult> {
  const session = await ensureSuperAdminActor();
  if (!session) return { success: false, error: "No autorizado" };

  const parsed = createSuperAdminSchema.safeParse(input);
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

  const birthDate = parseIsoDate(parsed.data.birthDate);
  if (!birthDate) return { success: false, fieldErrors: { birthDate: "Fecha invalida" } };

  const roleId = await getSuperAdminRoleId();
  if (!roleId) return { success: false, error: "Rol SUPERADMIN no configurado" };

  const [usernameExists, ciExists] = await Promise.all([
    prisma.auth.findUnique({ where: { username: parsed.data.username }, select: { id: true } }),
    prisma.employee.findUnique({ where: { ci: parsed.data.ci }, select: { id: true } }),
  ]);
  if (usernameExists) return { success: false, fieldErrors: { username: "El usuario ya existe" } };
  if (ciExists) return { success: false, fieldErrors: { ci: "La CI ya existe" } };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const created = await prisma.$transaction(async (tx) => {
    const auth = await tx.auth.create({
      data: {
        username: parsed.data.username,
        password: passwordHash,
        accountType: "EMPLOYEE",
        isActive: true,
      },
      select: { id: true },
    });

    const employee = await tx.employee.create({
      data: {
        authId: auth.id,
        roleId,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone || null,
        ci: parsed.data.ci,
        status: "ACTIVE",
        createdById: session.employeeId,
      },
      select: { id: true },
    });

    await tx.employeeProfile.create({
      data: {
        employeeId: employee.id,
        birthDate,
      },
    });

    await tx.employeeSettings.create({ data: { employeeId: employee.id } });

    await tx.auditLog.create({
      data: {
        entity: "SuperAdminAccount",
        entityId: employee.id,
        action: "CREATE",
        employeeId: session.employeeId,
        newValue: JSON.stringify({
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          username: parsed.data.username,
          ci: parsed.data.ci,
        }),
      },
    });

    return employee.id;
  });

  const record = await getSuperAdminById(created);
  if (!record) return { success: false, error: "No se pudo recuperar el registro creado" };

  return { success: true, superAdmin: mapSuperAdminRow(record) };
}
