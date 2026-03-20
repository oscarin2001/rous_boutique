"use server";

import bcrypt from "bcryptjs";

import { parseIsoDate } from "@/lib/field-validation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

import { ensureSuperAdminSession, getCredentialChangeWindow } from "./common";
import { updateProfileSchema, type UpdateProfileInput } from "../schemas/profile.schema";

export async function getSuperAdminProfileAction() {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  const employee = await prisma.employee.findUnique({
    where: { id: session.employeeId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      phone: true,
      ci: true,
      auth: { select: { id: true, username: true, lastLogin: true } },
    },
  });

  if (!employee) return { success: false, error: "Perfil no encontrado" };
  const credentialWindow = await getCredentialChangeWindow(employee.auth.id);

  return {
    success: true,
    data: {
      employeeId: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      birthDate: employee.birthDate ? employee.birthDate.toISOString().slice(0, 10) : "",
      phone: employee.phone ?? "",
      ci: employee.ci,
      username: employee.auth.username,
      lastLogin: employee.auth.lastLogin?.toISOString() ?? null,
      canChangeCredentials: credentialWindow.canChange,
      lastCredentialChangeAt: credentialWindow.lastCredentialChangeAt?.toISOString() ?? null,
      nextCredentialChangeAt: credentialWindow.nextCredentialChangeAt?.toISOString() ?? null,
    },
  };
}

export async function updateSuperAdminProfileAction(input: UpdateProfileInput) {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Datos invalidos" };

  const birthDate = parseIsoDate(parsed.data.birthDate);
  if (!birthDate) return { success: false, error: "Fecha de nacimiento invalida" };

  const existing = await prisma.employee.findUnique({
    where: { id: session.employeeId },
    select: { id: true, firstName: true, lastName: true, birthDate: true, phone: true, ci: true, role: { select: { code: true } }, auth: { select: { id: true, username: true, password: true } } },
  });
  if (!existing) return { success: false, error: "Perfil no encontrado" };

  const usernameChanged = parsed.data.username !== existing.auth.username;
  const passwordChanged = !!parsed.data.newPassword;
  const credentialsChanged = usernameChanged || passwordChanged;

  const validCurrentPassword = await bcrypt.compare(parsed.data.currentPassword, existing.auth.password);
  if (!validCurrentPassword) return { success: false, error: "La contrasena actual es incorrecta" };

  if (usernameChanged) {
    const authExists = await prisma.auth.findUnique({ where: { username: parsed.data.username } });
    if (authExists && authExists.id !== existing.auth.id) return { success: false, error: "El usuario ya existe" };
  }
  if (parsed.data.ci !== existing.ci) {
    const ciExists = await prisma.employee.findFirst({ where: { ci: parsed.data.ci, id: { not: existing.id } }, select: { id: true } });
    if (ciExists) return { success: false, error: "La CI ya existe" };
  }
  if (credentialsChanged) {
    const credentialWindow = await getCredentialChangeWindow(existing.auth.id);
    if (!credentialWindow.canChange) return { success: false, error: `Solo puedes cambiar usuario/contrasena cada 3 meses. Proximo cambio: ${credentialWindow.nextCredentialChangeAt?.toLocaleDateString("es-BO") ?? "pendiente"}` };
  }

  await prisma.$transaction(async (tx) => {
    await tx.employee.update({ where: { id: existing.id }, data: { firstName: parsed.data.firstName, lastName: parsed.data.lastName, birthDate, phone: parsed.data.phone || null, ci: parsed.data.ci } });
    if (credentialsChanged) await tx.auth.update({ where: { id: existing.auth.id }, data: { username: parsed.data.username, password: passwordChanged ? await bcrypt.hash(parsed.data.newPassword as string, 12) : undefined } });
    await tx.auditLog.create({ data: { entity: "SuperAdminProfile", entityId: existing.id, action: "UPDATE", employeeId: existing.id, oldValue: JSON.stringify({ firstName: existing.firstName, lastName: existing.lastName, birthDate: existing.birthDate?.toISOString() ?? null, phone: existing.phone, ci: existing.ci }), newValue: JSON.stringify({ firstName: parsed.data.firstName, lastName: parsed.data.lastName, birthDate: birthDate.toISOString(), phone: parsed.data.phone || null, ci: parsed.data.ci }) } });
    if (credentialsChanged) await tx.auditLog.create({ data: { entity: "SuperAdminCredentials", entityId: existing.auth.id, action: "UPDATE", employeeId: existing.id, oldValue: JSON.stringify({ username: existing.auth.username, passwordChanged: false }), newValue: JSON.stringify({ username: parsed.data.username, passwordChanged }) } });
  });

  const setting = await prisma.employeeSettings.findUnique({ where: { employeeId: existing.id }, select: { sessionTtlMinutes: true } });
  await createSession({ authId: existing.auth.id, employeeId: existing.id, username: parsed.data.username, roleCode: existing.role.code, firstName: parsed.data.firstName, lastName: parsed.data.lastName }, { ttlMinutes: setting?.sessionTtlMinutes ?? 480, reuseSessionId: session.sessionId });
  return { success: true, data: { firstName: parsed.data.firstName, lastName: parsed.data.lastName } };
}
