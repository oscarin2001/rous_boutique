"use server";

import bcrypt from "bcryptjs";

import { parseIsoDate } from "@/lib/field-validation";
import { prisma } from "@/lib/prisma";

import { ensureSuperAdminSession } from "./common";
import { createSuperAdminAccountSchema, type CreateSuperAdminAccountInput } from "../schemas/security.schema";

export async function getRecentSuperAdminSessionsAction() {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  const sessions = await prisma.authSession.findMany({
    where: { authId: session.authId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { sessionId: true, deviceType: true, browser: true, os: true, ipAddress: true, createdAt: true, lastSeenAt: true, expiresAt: true, revokedAt: true },
  });

  return {
    success: true,
    data: sessions.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      lastSeenAt: item.lastSeenAt.toISOString(),
      expiresAt: item.expiresAt.toISOString(),
      revokedAt: item.revokedAt?.toISOString() ?? null,
      isCurrent: item.sessionId === session.sessionId,
    })),
  };
}

export async function revokeOtherSuperAdminSessionsAction(input: { currentPassword: string }) {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  if (!input.currentPassword?.trim()) return { success: false, error: "Ingresa tu contrasena actual" };

  const auth = await prisma.auth.findUnique({ where: { id: session.authId }, select: { password: true } });
  if (!auth) return { success: false, error: "Sesion invalida" };
  const validCurrentPassword = await bcrypt.compare(input.currentPassword, auth.password);
  if (!validCurrentPassword) return { success: false, error: "La contrasena actual es incorrecta" };

  const targetSessions = await prisma.authSession.findMany({
    where: { authId: session.authId, revokedAt: null, sessionId: { not: session.sessionId } },
    select: {
      sessionId: true,
      deviceType: true,
      browser: true,
      os: true,
      ipAddress: true,
      createdAt: true,
      lastSeenAt: true,
    },
  });

  const result = await prisma.authSession.updateMany({
    where: { authId: session.authId, revokedAt: null, sessionId: { not: session.sessionId } },
    data: { revokedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      entity: "SuperAdminSessions",
      entityId: session.employeeId,
      action: "UPDATE",
      employeeId: session.employeeId,
      newValue: JSON.stringify({
        actor: {
          employeeId: session.employeeId,
          username: session.username,
          fullName: `${session.firstName} ${session.lastName}`,
          sessionId: session.sessionId,
        },
        revokedSessions: result.count,
        targets: targetSessions.map((item) => ({
          sessionId: item.sessionId,
          ipAddress: item.ipAddress,
          browser: item.browser,
          os: item.os,
          deviceType: item.deviceType,
          createdAt: item.createdAt.toISOString(),
          lastSeenAt: item.lastSeenAt.toISOString(),
        })),
      }),
    },
  });

  return { success: true, count: result.count };
}

export async function createSuperAdminAccountAction(input: CreateSuperAdminAccountInput) {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  const parsed = createSuperAdminAccountSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Datos invalidos" };

  const currentAuth = await prisma.auth.findUnique({ where: { id: session.authId }, select: { password: true } });
  if (!currentAuth) return { success: false, error: "Sesion invalida" };
  const validCurrentPassword = await bcrypt.compare(parsed.data.currentPassword, currentAuth.password);
  if (!validCurrentPassword) return { success: false, error: "La contrasena actual es incorrecta" };

  const birthDate = parseIsoDate(parsed.data.birthDate);
  if (!birthDate) return { success: false, error: "Fecha de nacimiento invalida" };

  const [existingAuth, existingCi, role] = await Promise.all([
    prisma.auth.findUnique({ where: { username: parsed.data.username }, select: { id: true } }),
    prisma.employee.findUnique({ where: { ci: parsed.data.ci }, select: { id: true } }),
    prisma.role.findUnique({ where: { code: "SUPERADMIN" }, select: { id: true } }),
  ]);
  if (existingAuth) return { success: false, error: "El usuario ya existe" };
  if (existingCi) return { success: false, error: "La CI ya existe" };
  if (!role) return { success: false, error: "Rol SUPERADMIN no configurado" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const created = await prisma.$transaction(async (tx) => {
    const auth = await tx.auth.create({ data: { username: parsed.data.username, password: passwordHash, accountType: "EMPLOYEE", isActive: true } });
    const employee = await tx.employee.create({
      data: { authId: auth.id, roleId: role.id, firstName: parsed.data.firstName, lastName: parsed.data.lastName, birthDate, phone: parsed.data.phone || null, ci: parsed.data.ci, status: "ACTIVE", createdById: session.employeeId },
      select: { id: true, firstName: true, lastName: true },
    });
    await tx.employeeSettings.create({ data: { employeeId: employee.id } });
    await tx.auditLog.create({ data: { entity: "SuperAdminAccount", entityId: employee.id, action: "CREATE", employeeId: session.employeeId, newValue: JSON.stringify({ username: parsed.data.username, fullName: `${employee.firstName} ${employee.lastName}` }) } });
    return employee;
  });

  return { success: true, data: created };
}
