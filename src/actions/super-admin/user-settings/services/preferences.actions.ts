"use server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

import { ensureSuperAdminSession, getOrCreateEmployeeSettings } from "./common";
import { updateSystemSchema, type UpdateSystemInput } from "../schemas/preferences.schema";

type ToolbarLanguage = "es" | "en" | "pt" | "fr";

const TOOLBAR_LANGUAGES = new Set<ToolbarLanguage>(["es"]);

export async function getSuperAdminToolbarLanguageAction() {
  try {
    const session = await ensureSuperAdminSession();
    if (!session) return { success: false, error: "No autorizado" };

    const settings = await getOrCreateEmployeeSettings(session.employeeId);

    if (settings.language !== "es") {
      await prisma.employeeSettings.update({
        where: { employeeId: session.employeeId },
        data: { language: "es" },
      });
    }

    return { success: true, data: { language: "es" as const } };
  } catch (error) {
    console.error("Error getting toolbar language:", error);
    return { success: false, error: "Error interno del servidor" };
  }
}

export async function updateSuperAdminToolbarLanguageAction(language: ToolbarLanguage) {
  try {
    const session = await ensureSuperAdminSession();
    if (!session) return { success: false, error: "No autorizado" };

    if (!TOOLBAR_LANGUAGES.has(language)) return { success: false, error: "Idioma invalido" };

    const existing = await getOrCreateEmployeeSettings(session.employeeId);
    if (existing.language === language) return { success: true };

    await prisma.$transaction(async (tx) => {
      await tx.employeeSettings.update({
        where: { employeeId: session.employeeId },
        data: { language },
      });

      await tx.auditLog.create({
        data: {
          entity: "SuperAdminToolbarLanguage",
          entityId: session.employeeId,
          action: "UPDATE",
          employeeId: session.employeeId,
          oldValue: JSON.stringify({ language: existing.language }),
          newValue: JSON.stringify({ language }),
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating toolbar language:", error);
    return { success: false, error: "Error interno del servidor" };
  }
}

export async function getSuperAdminSystemSettingsAction() {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  const settings = await getOrCreateEmployeeSettings(session.employeeId);
  return {
    success: true,
    data: {
      theme: settings.theme.toLowerCase() as "light" | "dark" | "system",
      language: (["es", "en", "pt", "fr"].includes(settings.language) ? settings.language : "es") as "es" | "en" | "pt" | "fr",
      notifications: settings.notifications,
      timezone: settings.timezone,
      dateFormat: settings.dateFormat as "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD",
      timeFormat: settings.timeFormat as "12h" | "24h",
      currency: settings.currency as "BOB" | "USD" | "EUR",
      sessionTtlMinutes: settings.sessionTtlMinutes,
      emergencyPhone: settings.emergencyPhone ?? "",
      emergencyContactName: settings.emergencyContactName ?? "",
      emergencyContactPhone: settings.emergencyContactPhone ?? "",
      signatureDisplayName: settings.signatureDisplayName ?? "",
      signatureTitle: settings.signatureTitle ?? "",
      notificationChannels: {
        login: settings.notifyOnLogin,
        create: settings.notifyOnCreate,
        update: settings.notifyOnUpdate,
        delete: settings.notifyOnDelete,
        security: settings.notifyOnSecurity,
      },
    },
  };
}

export async function updateSuperAdminSystemSettingsAction(input: UpdateSystemInput) {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  const parsed = updateSystemSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Datos invalidos" };

  const existingEmployee = await prisma.employee.findUnique({
    where: { id: session.employeeId },
    select: { auth: { select: { password: true } } },
  });
  if (!existingEmployee) return { success: false, error: "Perfil no encontrado" };

  const validCurrentPassword = await bcrypt.compare(parsed.data.currentPassword, existingEmployee.auth.password);
  if (!validCurrentPassword) return { success: false, error: "La contrasena actual es incorrecta" };

  const existingSettings = await getOrCreateEmployeeSettings(session.employeeId);
  await prisma.$transaction(async (tx) => {
    await tx.employeeSettings.update({
      where: { employeeId: session.employeeId },
      data: {
        theme: parsed.data.theme.toUpperCase() as "LIGHT" | "DARK" | "SYSTEM",
        language: parsed.data.language,
        notifications: parsed.data.notifications,
        timezone: parsed.data.timezone,
        dateFormat: parsed.data.dateFormat,
        timeFormat: parsed.data.timeFormat,
        currency: parsed.data.currency,
        sessionTtlMinutes: parsed.data.sessionTtlMinutes,
        emergencyPhone: parsed.data.emergencyPhone || null,
        emergencyContactName: parsed.data.emergencyContactName || null,
        emergencyContactPhone: parsed.data.emergencyContactPhone || null,
        signatureDisplayName: parsed.data.signatureDisplayName || null,
        signatureTitle: parsed.data.signatureTitle || null,
        notifyOnLogin: parsed.data.notificationChannels.login,
        notifyOnCreate: parsed.data.notificationChannels.create,
        notifyOnUpdate: parsed.data.notificationChannels.update,
        notifyOnDelete: parsed.data.notificationChannels.delete,
        notifyOnSecurity: parsed.data.notificationChannels.security,
      },
    });
    await tx.auditLog.create({
      data: {
        entity: "SuperAdminSystemSettings",
        entityId: session.employeeId,
        action: "UPDATE",
        employeeId: session.employeeId,
        oldValue: JSON.stringify({ ...existingEmployee, ...existingSettings, auth: undefined }),
        newValue: JSON.stringify({ ...parsed.data, currentPassword: undefined }),
      },
    });
  });

  return { success: true };
}
