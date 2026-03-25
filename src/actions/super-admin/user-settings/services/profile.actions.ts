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
const SKILL_ENTRY_REGEX = /^\s*[^:,]{2,40}\s*:\s*(100|[1-9]?\d)\s*$/;
const LANGUAGE_ENTRY_REGEX = /^\s*[^:,]{2,40}\s*:\s*(A1|A2|B1|B2|C1|C2)\s*:\s*[^:,]{2,60}\s*$/i;
const MAX_SKILLS_ENTRIES = 10;

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

type LanguageLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

type LanguageRow = {
  name: string;
  code: string;
  level: LanguageLevel;
  certification: string;
};

function formatLanguagesForInput(rows: { language: string; level: string | null }[]) {
  if (!rows.length) return "";
  return rows
    .map((item) => {
      const rawLanguage = item.language.trim();
      const displayLanguage = rawLanguage.includes("[")
        ? rawLanguage.slice(0, rawLanguage.indexOf("[")).trim()
        : rawLanguage;

      const rawLevel = (item.level ?? "A1").trim();
      const [levelPart, certificationPart] = rawLevel.includes("|")
        ? rawLevel.split("|").map((part) => part.trim())
        : [rawLevel, "Sin certificacion"];

      const normalizedLevel = ["A1", "A2", "B1", "B2", "C1", "C2"].includes(levelPart.toUpperCase())
        ? levelPart.toUpperCase()
        : "A1";

      return `${displayLanguage}:${normalizedLevel}:${certificationPart || "Sin certificacion"}`;
    })
    .join(", ");
}

function parseLanguagesFromInput(raw: string | null | undefined) {
  const text = (raw ?? "").trim();
  if (!text) return [] as LanguageRow[];

  const rows = text
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk, index) => {
      const [namePart, levelPart, certificationPart] = chunk.split(":");
      const name = (namePart ?? "").trim() || `Idioma ${index + 1}`;
      const level = (levelPart ?? "A1").trim().toUpperCase();
      const normalizedLevel: LanguageLevel = ["A1", "A2", "B1", "B2", "C1", "C2"].includes(level)
        ? (level as LanguageLevel)
        : "A1";

      return {
        name,
        code: name.slice(0, 2).toLowerCase(),
        level: normalizedLevel,
        certification: (certificationPart ?? "Sin certificacion").trim() || "Sin certificacion",
      };
    });

  return rows;
}

function parseSkillsFromInput(raw: string | null | undefined) {
  const text = (raw ?? "").trim();
  if (!text) return [] as { name: string; level: string }[];

  return text
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [namePart, levelPart] = chunk.split(":");
      const name = (namePart ?? "").trim();
      const level = (levelPart ?? "0").trim();
      return { name, level };
    })
    .filter((item) => item.name.length > 0);
}

function formatSkillsForInput(rows: { name: string; level: string | null }[]) {
  if (!rows.length) return "";
  return rows.map((item) => `${item.name}:${item.level ?? "0"}`).join(", ");
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
    select: { id: true, employeeProfile: { select: { photoUrl: true } } },
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
    await tx.employeeProfile.upsert({
      where: { employeeId: employee.id },
      update: { photoUrl },
      create: { employeeId: employee.id, photoUrl },
    });

    await tx.auditLog.create({
      data: {
        entity: "SuperAdminProfilePhoto",
        entityId: employee.id,
        action: "UPDATE",
        employeeId: employee.id,
        oldValue: JSON.stringify({ photoUrl: employee.employeeProfile?.photoUrl ?? null }),
        newValue: JSON.stringify({ photoUrl }),
      },
    });
  });

  if (employee.employeeProfile?.photoUrl && employee.employeeProfile.photoUrl !== photoUrl) {
    await deleteManagedPhotoFile(employee.employeeProfile.photoUrl);
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
      phone: true,
      ci: true,
      employeeProfile: { select: { birthDate: true, profession: true, photoUrl: true, aboutMe: true } },
      employeeSkills: { select: { name: true, level: true }, orderBy: { createdAt: "asc" } },
      employeeLanguages: { select: { language: true, level: true }, orderBy: { createdAt: "asc" } },
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
      birthDate: employee.employeeProfile?.birthDate ? employee.employeeProfile.birthDate.toISOString().slice(0, 10) : "",
      phone: employee.phone ?? "",
      ci: employee.ci,
      profession: employee.employeeProfile?.profession ?? "",
      photoUrl: employee.employeeProfile?.photoUrl ?? "",
      aboutMe: employee.employeeProfile?.aboutMe ?? "",
      skills: formatSkillsForInput(employee.employeeSkills),
      languages: formatLanguagesForInput(employee.employeeLanguages),
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
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      ci: true,
      role: { select: { code: true } },
      auth: { select: { id: true, username: true, password: true } },
      employeeProfile: {
        select: { birthDate: true, profession: true, photoUrl: true, aboutMe: true },
      },
      employeeSkills: { select: { name: true, level: true }, orderBy: { createdAt: "asc" } },
      employeeLanguages: { select: { language: true, level: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!existing) return { success: false, error: "Perfil no encontrado" };

  const professionChanged = parsed.data.profession !== (existing.employeeProfile?.profession ?? "");
  const aboutMeChanged = parsed.data.aboutMe !== (existing.employeeProfile?.aboutMe ?? "");
  const skillsChanged = parsed.data.skills !== formatSkillsForInput(existing.employeeSkills);
  const languagesChanged = parsed.data.languages !== formatLanguagesForInput(existing.employeeLanguages);

  if (professionChanged && parsed.data.profession && parsed.data.profession.trim().length < 3) {
    return { success: false, error: "Profesion demasiado corta" };
  }
  if (professionChanged && parsed.data.profession && /\s{2,}/.test(parsed.data.profession.trim())) {
    return { success: false, error: "Evita espacios dobles en profesion" };
  }
  if (aboutMeChanged && parsed.data.aboutMe && parsed.data.aboutMe.trim().length < 30) {
    return { success: false, error: "Acerca de mi debe tener al menos 30 caracteres" };
  }
  if (skillsChanged && parsed.data.skills) {
    const entries = parsed.data.skills.split(",").map((item) => item.trim()).filter(Boolean);
    if (entries.length > MAX_SKILLS_ENTRIES) {
      return { success: false, error: `Puedes registrar maximo ${MAX_SKILLS_ENTRIES} habilidades` };
    }
    if (entries.some((entry) => !SKILL_ENTRY_REGEX.test(entry))) {
      return { success: false, error: "Formato de habilidades invalido. Usa Nombre:80, Ventas:95" };
    }
  }
  if (languagesChanged && parsed.data.languages) {
    const entries = parsed.data.languages.split(",").map((item) => item.trim()).filter(Boolean);
    if (entries.some((entry) => !LANGUAGE_ENTRY_REGEX.test(entry))) {
      return { success: false, error: "Formato de idiomas invalido. Usa Espanol:C2:Nativo, Ingles:B2:IELTS" };
    }
  }

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
  const normalizedLanguages = parseLanguagesFromInput(parsed.data.languages);
  const normalizedSkills = parseSkillsFromInput(parsed.data.skills);

  await prisma.$transaction(async (tx) => {
    await tx.employee.update({
      where: { id: existing.id },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone || null,
        ci: parsed.data.ci,
      },
    });

    await tx.employeeProfile.upsert({
      where: { employeeId: existing.id },
      update: {
        birthDate,
        profession: parsed.data.profession || null,
        photoUrl: normalizedPhotoUrl,
        aboutMe: parsed.data.aboutMe || null,
      },
      create: {
        employeeId: existing.id,
        birthDate,
        profession: parsed.data.profession || null,
        photoUrl: normalizedPhotoUrl,
        aboutMe: parsed.data.aboutMe || null,
      },
    });

    await tx.employeeSkill.deleteMany({ where: { employeeId: existing.id } });
    if (normalizedSkills.length > 0) {
      await tx.employeeSkill.createMany({
        data: normalizedSkills.map((item) => ({
          employeeId: existing.id,
          name: item.name,
          level: item.level,
        })),
      });
    }

    await tx.employeeLanguage.deleteMany({ where: { employeeId: existing.id } });
    if (normalizedLanguages.length > 0) {
      await tx.employeeLanguage.createMany({
        data: normalizedLanguages.map((item) => ({
          employeeId: existing.id,
          language: `${item.name} [${item.code}]`,
          level: item.certification ? `${item.level} | ${item.certification}` : item.level,
        })),
      });
    }

    if (credentialsChanged) await tx.auth.update({ where: { id: existing.auth.id }, data: { username: parsed.data.username, password: passwordChanged ? await bcrypt.hash(parsed.data.newPassword as string, 12) : undefined } });
    await tx.auditLog.create({ data: { entity: "SuperAdminProfile", entityId: existing.id, action: "UPDATE", employeeId: existing.id, oldValue: JSON.stringify({ firstName: existing.firstName, lastName: existing.lastName, birthDate: existing.employeeProfile?.birthDate?.toISOString() ?? null, phone: existing.phone, ci: existing.ci, profession: existing.employeeProfile?.profession ?? null, photoUrl: existing.employeeProfile?.photoUrl ?? null, aboutMe: existing.employeeProfile?.aboutMe ?? null, skills: existing.employeeSkills, languages: existing.employeeLanguages }), newValue: JSON.stringify({ firstName: parsed.data.firstName, lastName: parsed.data.lastName, birthDate: birthDate.toISOString(), phone: parsed.data.phone || null, ci: parsed.data.ci, profession: parsed.data.profession || null, photoUrl: normalizedPhotoUrl, aboutMe: parsed.data.aboutMe || null, skills: normalizedSkills, languages: normalizedLanguages }) } });
    if (credentialsChanged) await tx.auditLog.create({ data: { entity: "SuperAdminCredentials", entityId: existing.auth.id, action: "UPDATE", employeeId: existing.id, oldValue: JSON.stringify({ username: existing.auth.username, passwordChanged: false }), newValue: JSON.stringify({ username: parsed.data.username, passwordChanged }) } });
  });

  if (existing.employeeProfile?.photoUrl && existing.employeeProfile.photoUrl !== normalizedPhotoUrl) {
    await deleteManagedPhotoFile(existing.employeeProfile.photoUrl);
  }

  const setting = await prisma.employeeSettings.findUnique({ where: { employeeId: existing.id }, select: { sessionTtlMinutes: true } });
  await createSession({ authId: existing.auth.id, employeeId: existing.id, username: parsed.data.username, roleCode: existing.role.code, firstName: parsed.data.firstName, lastName: parsed.data.lastName }, { ttlMinutes: setting?.sessionTtlMinutes ?? 480, reuseSessionId: session.sessionId });
  return { success: true, data: { firstName: parsed.data.firstName, lastName: parsed.data.lastName } };
}
