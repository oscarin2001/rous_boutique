"use server";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import bcrypt from "bcryptjs";

import { parseIsoDate } from "@/lib/field-validation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

import { ensureSuperAdminSession, getCredentialChangeWindow } from "./common";
import { updateProfileSchema, type UpdateProfileInput } from "../schemas/profile.schema";

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const EMPLOYEE_PHOTO_PREFIX = "/uploads/employees/";

function resolveManagedPhotoDiskPath(photoUrl: string | null | undefined): string | null {
  if (!photoUrl || !photoUrl.startsWith(EMPLOYEE_PHOTO_PREFIX)) return null;

  const fileName = path.basename(photoUrl);
  if (!fileName || fileName === "." || fileName === "..") return null;

  return path.join(process.cwd(), "public", "uploads", "employees", fileName);
}

async function deleteManagedPhotoFile(photoUrl: string | null | undefined) {
  const diskPath = resolveManagedPhotoDiskPath(photoUrl);
  if (!diskPath) return;

  try {
    await unlink(diskPath);
  } catch {
    // Ignore missing/deleted files to keep update flow resilient.
  }
}

export async function uploadSuperAdminProfilePhotoAction(file: File) {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  if (!file || !file.size) return { success: false, error: "Selecciona una imagen" };
  if (file.size > MAX_PHOTO_SIZE_BYTES) return { success: false, error: "La imagen no puede superar 5MB" };

  const extension = MIME_TO_EXTENSION[file.type];
  if (!extension) return { success: false, error: "Formato invalido. Usa JPG, PNG o WEBP" };

  const employee = await prisma.employee.findUnique({
    where: { id: session.employeeId },
    select: { id: true, photoUrl: true },
  });
  if (!employee) return { success: false, error: "Perfil no encontrado" };

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = `employee-${employee.id}-${Date.now()}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "employees");
  const diskPath = path.join(uploadDir, fileName);
  const photoUrl = `/uploads/employees/${fileName}`;

  await mkdir(uploadDir, { recursive: true });
  await writeFile(diskPath, buffer);

  await prisma.$transaction(async (tx) => {
    await tx.employee.update({
      where: { id: employee.id },
      data: { photoUrl },
    });

    await tx.auditLog.create({
      data: {
        entity: "SuperAdminProfilePhoto",
        entityId: employee.id,
        action: "UPDATE",
        employeeId: employee.id,
        oldValue: JSON.stringify({ photoUrl: employee.photoUrl ?? null }),
        newValue: JSON.stringify({ photoUrl }),
      },
    });
  });

  if (employee.photoUrl && employee.photoUrl !== photoUrl) {
    await deleteManagedPhotoFile(employee.photoUrl);
  }

  return { success: true, data: { photoUrl } };
}

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
      profession: true,
      photoUrl: true,
      aboutMe: true,
      skills: true,
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
      profession: employee.profession ?? "",
      photoUrl: employee.photoUrl ?? "",
      aboutMe: employee.aboutMe ?? "",
      skills: employee.skills ?? "",
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
    select: { id: true, firstName: true, lastName: true, birthDate: true, phone: true, ci: true, profession: true, photoUrl: true, aboutMe: true, skills: true, role: { select: { code: true } }, auth: { select: { id: true, username: true, password: true } } },
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

  const normalizedPhotoUrl = parsed.data.photoUrl || null;

  await prisma.$transaction(async (tx) => {
    await tx.employee.update({ where: { id: existing.id }, data: { firstName: parsed.data.firstName, lastName: parsed.data.lastName, birthDate, phone: parsed.data.phone || null, ci: parsed.data.ci, profession: parsed.data.profession || null, photoUrl: normalizedPhotoUrl, aboutMe: parsed.data.aboutMe || null, skills: parsed.data.skills || null } });
    if (credentialsChanged) await tx.auth.update({ where: { id: existing.auth.id }, data: { username: parsed.data.username, password: passwordChanged ? await bcrypt.hash(parsed.data.newPassword as string, 12) : undefined } });
    await tx.auditLog.create({ data: { entity: "SuperAdminProfile", entityId: existing.id, action: "UPDATE", employeeId: existing.id, oldValue: JSON.stringify({ firstName: existing.firstName, lastName: existing.lastName, birthDate: existing.birthDate?.toISOString() ?? null, phone: existing.phone, ci: existing.ci, profession: existing.profession ?? null, photoUrl: existing.photoUrl ?? null, aboutMe: existing.aboutMe ?? null, skills: existing.skills ?? null }), newValue: JSON.stringify({ firstName: parsed.data.firstName, lastName: parsed.data.lastName, birthDate: birthDate.toISOString(), phone: parsed.data.phone || null, ci: parsed.data.ci, profession: parsed.data.profession || null, photoUrl: normalizedPhotoUrl, aboutMe: parsed.data.aboutMe || null, skills: parsed.data.skills || null }) } });
    if (credentialsChanged) await tx.auditLog.create({ data: { entity: "SuperAdminCredentials", entityId: existing.auth.id, action: "UPDATE", employeeId: existing.id, oldValue: JSON.stringify({ username: existing.auth.username, passwordChanged: false }), newValue: JSON.stringify({ username: parsed.data.username, passwordChanged }) } });
  });

  if (existing.photoUrl && existing.photoUrl !== normalizedPhotoUrl) {
    await deleteManagedPhotoFile(existing.photoUrl);
  }

  const setting = await prisma.employeeSettings.findUnique({ where: { employeeId: existing.id }, select: { sessionTtlMinutes: true } });
  await createSession({ authId: existing.auth.id, employeeId: existing.id, username: parsed.data.username, roleCode: existing.role.code, firstName: parsed.data.firstName, lastName: parsed.data.lastName }, { ttlMinutes: setting?.sessionTtlMinutes ?? 480, reuseSessionId: session.sessionId });
  return { success: true, data: { firstName: parsed.data.firstName, lastName: parsed.data.lastName } };
}
