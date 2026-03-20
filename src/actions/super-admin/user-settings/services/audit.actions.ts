"use server";

import { prisma } from "@/lib/prisma";

import { ensureSuperAdminSession } from "./common";

const SETTINGS_ENTITIES = [
  "SuperAdminLogin",
  "SuperAdminProfile",
  "SuperAdminCredentials",
  "SuperAdminSystemSettings",
  "SuperAdminSessions",
  "SuperAdminAccount",
] as const;

type NotificationPrefs = {
  notifyOnLogin: boolean;
  notifyOnCreate: boolean;
  notifyOnUpdate: boolean;
  notifyOnDelete: boolean;
  notifyOnSecurity: boolean;
};

type AuditUiItem = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  actorName: string;
};

function eventTitle(entity: string, action: string): string {
  if (entity === "SuperAdminLogin") return "Ingreso al sistema";
  if (entity === "SuperAdminProfile") return "Perfil actualizado";
  if (entity === "SuperAdminCredentials") return "Credenciales actualizadas";
  if (entity === "SuperAdminSystemSettings") return "Configuracion del sistema actualizada";
  if (entity === "SuperAdminSessions") return "Sesiones revocadas";
  if (entity === "SuperAdminAccount") return "Cuenta superadmin creada";
  return `Evento ${entity} (${action})`;
}

function eventDescription(entity: string): string {
  if (entity === "SuperAdminLogin") return "Un usuario SUPERADMIN inicio sesion en el sistema.";
  if (entity === "SuperAdminSessions") return "Se cerraron sesiones activas en otros dispositivos.";
  if (entity === "SuperAdminAccount") return "Se registro una nueva cuenta con privilegios SUPERADMIN.";
  return "Se aplicaron cambios de configuracion en el modulo de superadmin.";
}

function parseJson<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function shouldNotify(log: { entity: string; action: string }, prefs: NotificationPrefs) {
  const isSecurityEntity = ["SuperAdminCredentials", "SuperAdminSessions", "SuperAdminAccount"].includes(log.entity);
  if (log.entity === "SuperAdminLogin") return prefs.notifyOnLogin;
  if (isSecurityEntity && prefs.notifyOnSecurity) return true;
  if (log.action === "CREATE") return prefs.notifyOnCreate;
  if (log.action === "UPDATE") return prefs.notifyOnUpdate;
  if (log.action === "DELETE") return prefs.notifyOnDelete;
  return false;
}

function mapLogToUiItem(log: {
  id: number;
  entity: string;
  action: string;
  createdAt: Date;
  ipAddress: string | null;
  newValue: string | null;
  employee: { firstName: string; lastName: string } | null;
}): AuditUiItem {
  const payload = parseJson<{ username?: string; targets?: Array<{ ipAddress?: string | null }> }>(log.newValue);
  const actorUsername = payload?.username ? `Usuario: ${payload.username}. ` : "";
  const firstTargetIp = payload?.targets?.[0]?.ipAddress;
  const ipInfo = firstTargetIp || log.ipAddress ? `IP: ${firstTargetIp ?? log.ipAddress}.` : "";
  return {
    id: log.id,
    title: eventTitle(log.entity, log.action),
    description: `${eventDescription(log.entity)} ${actorUsername}${ipInfo}`.trim(),
    createdAt: log.createdAt.toISOString(),
    actorName: log.employee ? `${log.employee.firstName} ${log.employee.lastName}` : "Sistema",
  };
}

export async function getSuperAdminAuditFeedAction() {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  const logs = await prisma.auditLog.findMany({
    where: { entity: { in: [...SETTINGS_ENTITIES] } },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      entity: true,
      action: true,
      ipAddress: true,
      newValue: true,
      createdAt: true,
      employee: { select: { firstName: true, lastName: true } },
    },
  });

  return { success: true, data: logs.map(mapLogToUiItem) };
}

export async function getSuperAdminToolbarNotificationsAction() {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  const settings = await prisma.employeeSettings.findUnique({
    where: { employeeId: session.employeeId },
    select: {
      notifyOnLogin: true,
      notifyOnCreate: true,
      notifyOnUpdate: true,
      notifyOnDelete: true,
      notifyOnSecurity: true,
      notificationLastReadAt: true,
    },
  });
  const prefs = settings ?? { notifyOnLogin: true, notifyOnCreate: true, notifyOnUpdate: true, notifyOnDelete: true, notifyOnSecurity: true };

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const logs = await prisma.auditLog.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true,
      entity: true,
      action: true,
      createdAt: true,
      ipAddress: true,
      newValue: true,
      employee: { select: { firstName: true, lastName: true } },
    },
  });

  const filtered = logs.filter((log) => shouldNotify(log, prefs));
  const lastReadAt = settings?.notificationLastReadAt ?? null;
  const unreadCount = lastReadAt ? filtered.filter((log) => log.createdAt > lastReadAt).length : filtered.length;
  return { success: true, data: { unreadCount, items: filtered.slice(0, 6).map(mapLogToUiItem) } };
}

export async function markSuperAdminToolbarNotificationsReadAction() {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };
  await prisma.employeeSettings.upsert({
    where: { employeeId: session.employeeId },
    create: { employeeId: session.employeeId, notificationLastReadAt: new Date() },
    update: { notificationLastReadAt: new Date() },
  });
  return { success: true };
}
