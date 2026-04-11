"use server";

import { prisma } from "@/lib/prisma";

import { ensureSuperAdminSession } from "./common";

const SETTINGS_ENTITIES = [
  "SuperAdminLogin",
  "SuperAdminProfile",
  "SuperAdminProfilePersonal",
  "SuperAdminProfileCompetencies",
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
  category: "security" | "system" | "account";
  showExactTimestamp: boolean;
  lastConnectionAt: string | null;
  isRead: boolean;
};

type NotificationCategory = "all" | "security" | "system" | "account";

type AuditSourceLog = {
  id: number;
  entity: string;
  action: string;
  createdAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  newValue: string | null;
  employee: { firstName: string; lastName: string } | null;
};

function eventTitle(entity: string, action: string): string {
  if (entity === "SuperAdminLogin") return "Nuevo inicio de sesion en dispositivo";
  if (entity === "SuperAdminProfile") return "Perfil actualizado";
  if (entity === "SuperAdminProfilePersonal") return "Datos personales actualizados";
  if (entity === "SuperAdminProfileCompetencies") return "Competencias actualizadas";
  if (entity === "SuperAdminCredentials") return "Credenciales actualizadas";
  if (entity === "SuperAdminSystemSettings") return "Configuracion del sistema actualizada";
  if (entity === "SuperAdminSessions") return "Sesiones revocadas";
  if (entity === "SuperAdminAccount") return "Cuenta superadmin creada";
  return `Evento ${entity} (${action})`;
}

function eventDescription(entity: string): string {
  if (entity === "SuperAdminLogin") return "Se detecto actividad de inicio de sesion. Solo se muestra la ultima conexion por dispositivo.";
  if (entity === "SuperAdminSessions") return "Se cerraron sesiones activas en otros dispositivos.";
  if (entity === "SuperAdminAccount") return "Se registro una nueva cuenta con privilegios SUPERADMIN.";
  if (entity === "SuperAdminProfilePersonal") return "Se actualizaron datos personales del perfil del superadmin.";
  if (entity === "SuperAdminProfileCompetencies") return "Se actualizaron habilidades o idiomas del perfil del superadmin.";
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

function parseIdsSet(value: string | null | undefined): Set<number> {
  if (!value) return new Set();
  const parsed = parseJson<number[]>(value);
  if (!parsed || !Array.isArray(parsed)) return new Set();
  return new Set(parsed.filter((id) => Number.isInteger(id) && id > 0));
}

function serializeIdsSet(ids: Set<number>): string {
  return JSON.stringify(Array.from(ids).sort((a, b) => a - b));
}

function notificationCategory(entity: string): "security" | "system" | "account" {
  if (entity === "SuperAdminLogin" || entity === "SuperAdminCredentials" || entity === "SuperAdminSessions") return "security";
  if (entity === "SuperAdminSystemSettings") return "system";
  return "account";
}

function compactLoginByDevice(logs: AuditSourceLog[]): AuditSourceLog[] {
  const seenDevice = new Set<string>();
  const compacted: AuditSourceLog[] = [];

  for (const log of logs) {
    if (log.entity !== "SuperAdminLogin") {
      compacted.push(log);
      continue;
    }

    const payload = parseJson<{ username?: string }>(log.newValue);
    const key = `${payload?.username ?? "unknown"}|${log.ipAddress ?? "no-ip"}|${log.userAgent ?? "unknown"}`;
    if (seenDevice.has(key)) continue;
    seenDevice.add(key);
    compacted.push(log);
  }

  return compacted;
}

function getDeviceLabel(log: Pick<AuditSourceLog, "newValue" | "userAgent">): string {
  const payload = parseJson<{ browser?: string; os?: string; deviceType?: string }>(log.newValue);
  const browser = payload?.browser ?? null;
  const os = payload?.os ?? null;
  const type = payload?.deviceType === "MOBILE" ? "movil" : payload?.deviceType === "WEB" ? "web" : null;
  if (browser && os && type) return `${browser} en ${os} (${type})`;
  if (browser && os) return `${browser} en ${os}`;
  if (browser) return browser;
  if (os) return os;
  if (type) return type;
  return "dispositivo identificado";
}

async function getNotificationContext(sessionEmployeeId: number) {
  const settings = await prisma.employeeSettings.findUnique({
    where: { employeeId: sessionEmployeeId },
    select: {
      notifyOnLogin: true,
      notifyOnCreate: true,
      notifyOnUpdate: true,
      notifyOnDelete: true,
      notifyOnSecurity: true,
      notificationLastReadAt: true,
      notificationDismissedIds: true,
      notificationReadIds: true,
    },
  });

  const prefs: NotificationPrefs = settings ?? {
    notifyOnLogin: true,
    notifyOnCreate: true,
    notifyOnUpdate: true,
    notifyOnDelete: true,
    notifyOnSecurity: true,
  };

  const logs = await prisma.auditLog.findMany({
    where: { entity: { in: [...SETTINGS_ENTITIES] } },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      entity: true,
      action: true,
      createdAt: true,
      ipAddress: true,
      userAgent: true,
      newValue: true,
      employee: { select: { firstName: true, lastName: true } },
    },
  });

  const dismissed = parseIdsSet(settings?.notificationDismissedIds);
  const readIds = parseIdsSet(settings?.notificationReadIds);
  const notified = logs.filter((log) => shouldNotify(log, prefs));
  const visible = notified.filter((log) => !dismissed.has(log.id));
  const compacted = compactLoginByDevice(visible);

  return {
    settings,
    compacted,
    readIds,
  };
}

function mapLogToUiItem(log: AuditSourceLog, isRead: boolean): AuditUiItem {
  const payload = parseJson<{ username?: string; targets?: Array<{ ipAddress?: string | null }> }>(log.newValue);
  const firstTargetIp = payload?.targets?.[0]?.ipAddress;
  const ipValue = firstTargetIp ?? log.ipAddress;
  const isLoginEvent = log.entity === "SuperAdminLogin";
  const actorUsername = payload?.username ? `Usuario: ${payload.username}. ` : "";
  const ipInfo = ipValue ? `IP: ${ipValue}.` : "";
  const loginDescription = `${eventDescription(log.entity)} Dispositivo: ${getDeviceLabel(log)}. ${actorUsername}${ipInfo}`.trim();
  const description = isLoginEvent ? loginDescription : `${eventDescription(log.entity)} ${actorUsername}${ipInfo}`.trim();

  return {
    id: log.id,
    title: eventTitle(log.entity, log.action),
    description,
    createdAt: log.createdAt.toISOString(),
    actorName: log.employee ? `${log.employee.firstName} ${log.employee.lastName}` : "Sistema",
    category: notificationCategory(log.entity),
    showExactTimestamp: !isLoginEvent,
    lastConnectionAt: isLoginEvent ? log.createdAt.toISOString() : null,
    isRead,
  };
}

function filterByCategory(logs: AuditSourceLog[], category: NotificationCategory): AuditSourceLog[] {
  if (category === "all") return logs;
  return logs.filter((log) => notificationCategory(log.entity) === category);
}

export async function getSuperAdminAuditFeedAction() {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  const logs = await prisma.auditLog.findMany({
    where: { entity: { in: SETTINGS_ENTITIES.filter((entity) => entity !== "SuperAdminLogin") } },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      entity: true,
      action: true,
      ipAddress: true,
      userAgent: true,
      newValue: true,
      createdAt: true,
      employee: { select: { firstName: true, lastName: true } },
    },
  });

  return { success: true, data: logs.map((log) => mapLogToUiItem(log, true)) };
}

export async function getSuperAdminToolbarNotificationsAction() {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  const context = await getNotificationContext(session.employeeId);
  const unreadCount = context.compacted.filter((log) => !context.readIds.has(log.id)).length;
  return {
    success: true,
    data: {
      unreadCount,
      items: context.compacted.slice(0, 6).map((log) => mapLogToUiItem(log, context.readIds.has(log.id))),
    },
  };
}

export async function getSuperAdminNotificationsAction(params?: {
  page?: number;
  pageSize?: number;
  category?: NotificationCategory;
}) {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  const context = await getNotificationContext(session.employeeId);
  const category = params?.category ?? "all";
  const pageSize = Math.min(Math.max(params?.pageSize ?? 20, 5), 50);
  const page = Math.max(params?.page ?? 1, 1);
  const filtered = filterByCategory(context.compacted, category);
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return {
    success: true,
    data: {
      total,
      page: safePage,
      pageSize,
      pageCount,
      category,
      unreadCount: filtered.filter((log) => !context.readIds.has(log.id)).length,
      items: paged.map((log) => mapLogToUiItem(log, context.readIds.has(log.id))),
    },
  };
}

export async function dismissSuperAdminNotificationsAction(ids: number[]) {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  const cleanIds = Array.from(new Set(ids.filter((id) => Number.isInteger(id) && id > 0))).slice(0, 300);
  if (!cleanIds.length) return { success: false, error: "Selecciona al menos una notificacion" };

  const existing = await prisma.employeeSettings.findUnique({
    where: { employeeId: session.employeeId },
    select: { notificationDismissedIds: true, notificationReadIds: true },
  });
  const dismissed = parseIdsSet(existing?.notificationDismissedIds);
  const readIds = parseIdsSet(existing?.notificationReadIds);
  for (const id of cleanIds) dismissed.add(id);
  for (const id of cleanIds) readIds.delete(id);

  await prisma.employeeSettings.upsert({
    where: { employeeId: session.employeeId },
    create: {
      employeeId: session.employeeId,
      notificationDismissedIds: serializeIdsSet(dismissed),
      notificationReadIds: serializeIdsSet(readIds),
    },
    update: {
      notificationDismissedIds: serializeIdsSet(dismissed),
      notificationReadIds: serializeIdsSet(readIds),
    },
  });

  return { success: true, count: cleanIds.length };
}

export async function dismissAllSuperAdminNotificationsByCategoryAction(category: NotificationCategory) {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  const context = await getNotificationContext(session.employeeId);
  const targets = filterByCategory(context.compacted, category).map((log) => log.id);
  if (!targets.length) return { success: true, count: 0 };

  const dismissed = parseIdsSet(context.settings?.notificationDismissedIds);
  const readIds = parseIdsSet(context.settings?.notificationReadIds);
  for (const id of targets) {
    dismissed.add(id);
    readIds.delete(id);
  }

  await prisma.employeeSettings.upsert({
    where: { employeeId: session.employeeId },
    create: {
      employeeId: session.employeeId,
      notificationDismissedIds: serializeIdsSet(dismissed),
      notificationReadIds: serializeIdsSet(readIds),
    },
    update: {
      notificationDismissedIds: serializeIdsSet(dismissed),
      notificationReadIds: serializeIdsSet(readIds),
    },
  });

  return { success: true, count: targets.length };
}

export async function setSuperAdminNotificationsReadStateAction(ids: number[], read: boolean) {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  const cleanIds = Array.from(new Set(ids.filter((id) => Number.isInteger(id) && id > 0))).slice(0, 300);
  if (!cleanIds.length) return { success: false, error: "Selecciona al menos una notificacion" };

  const existing = await prisma.employeeSettings.findUnique({
    where: { employeeId: session.employeeId },
    select: { notificationReadIds: true, notificationDismissedIds: true },
  });
  const readIds = parseIdsSet(existing?.notificationReadIds);
  const dismissed = parseIdsSet(existing?.notificationDismissedIds);

  for (const id of cleanIds) {
    if (dismissed.has(id)) continue;
    if (read) readIds.add(id);
    else readIds.delete(id);
  }

  await prisma.employeeSettings.upsert({
    where: { employeeId: session.employeeId },
    create: {
      employeeId: session.employeeId,
      notificationReadIds: serializeIdsSet(readIds),
    },
    update: {
      notificationReadIds: serializeIdsSet(readIds),
    },
  });

  return { success: true, count: cleanIds.length };
}

export async function markSuperAdminToolbarNotificationsReadAction() {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  const context = await getNotificationContext(session.employeeId);
  const readIds = parseIdsSet(context.settings?.notificationReadIds);
  for (const id of context.compacted.slice(0, 6).map((log) => log.id)) readIds.add(id);

  await prisma.employeeSettings.upsert({
    where: { employeeId: session.employeeId },
    create: {
      employeeId: session.employeeId,
      notificationLastReadAt: new Date(),
      notificationReadIds: serializeIdsSet(readIds),
    },
    update: {
      notificationLastReadAt: new Date(),
      notificationReadIds: serializeIdsSet(readIds),
    },
  });
  return { success: true };
}
