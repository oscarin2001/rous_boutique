"use server";

import { prisma } from "@/lib/prisma";

import type { WarehouseHistoryPage, WarehouseHistoryRow } from "../types/warehouse";

interface GetWarehouseHistoryOptions {
  cursor?: number | null;
  limit?: number;
  changedFrom?: string | null;
  changedTo?: string | null;
  latestDays?: number | null;
}

const DEFAULT_PAGE_SIZE = 15;
const MAX_PAGE_SIZE = 50;
const NOISY_FIELDS = new Set(["password", "passwordConfirm", "adminConfirmPassword"]);

type AuditPayload = Record<string, unknown>;

function parsePayload(value: string | null): AuditPayload | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") return null;
    return parsed as AuditPayload;
  } catch {
    return null;
  }
}

function isMeaningfulValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0;
  return true;
}

function equalValues(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function compactPayload(log: WarehouseHistoryRow) {
  const oldPayload = parsePayload(log.oldValue);
  const newPayload = parsePayload(log.newValue);

  if (log.action === "CREATE") {
    if (!newPayload) return { oldValue: null, newValue: log.newValue };

    const compact = Object.fromEntries(
      Object.entries(newPayload).filter(([key, value]) => !NOISY_FIELDS.has(key) && isMeaningfulValue(value))
    );

    return {
      oldValue: null,
      newValue: Object.keys(compact).length > 0 ? JSON.stringify(compact) : null,
    };
  }

  if (log.action === "DELETE") {
    if (!oldPayload) return { oldValue: log.oldValue, newValue: null };

    const compact = Object.fromEntries(
      Object.entries(oldPayload).filter(([key, value]) => !NOISY_FIELDS.has(key) && isMeaningfulValue(value))
    );

    return {
      oldValue: Object.keys(compact).length > 0 ? JSON.stringify(compact) : null,
      newValue: null,
    };
  }

  if (!oldPayload || !newPayload) return { oldValue: log.oldValue, newValue: log.newValue };

  const keys = Array.from(new Set([...Object.keys(oldPayload), ...Object.keys(newPayload)]));
  const changedKeys = keys.filter((key) => !NOISY_FIELDS.has(key) && !equalValues(oldPayload[key], newPayload[key]));

  const compactOld = Object.fromEntries(changedKeys.map((key) => [key, oldPayload[key]]));
  const compactNew = Object.fromEntries(changedKeys.map((key) => [key, newPayload[key]]));

  return {
    oldValue: Object.keys(compactOld).length > 0 ? JSON.stringify(compactOld) : null,
    newValue: Object.keys(compactNew).length > 0 ? JSON.stringify(compactNew) : null,
  };
}

function buildCreatedAtFilter(options: GetWarehouseHistoryOptions) {
  if (options.latestDays && options.latestDays > 0) {
    const from = new Date();
    from.setDate(from.getDate() - options.latestDays);
    return { gte: from };
  }

  const range: { gte?: Date; lte?: Date } = {};
  if (options.changedFrom) {
    const from = new Date(`${options.changedFrom}T00:00:00.000Z`);
    if (!Number.isNaN(from.getTime())) range.gte = from;
  }
  if (options.changedTo) {
    const to = new Date(`${options.changedTo}T23:59:59.999Z`);
    if (!Number.isNaN(to.getTime())) range.lte = to;
  }

  return range.gte || range.lte ? range : undefined;
}

export async function getWarehouseHistory(id: number, options: GetWarehouseHistoryOptions = {}): Promise<WarehouseHistoryPage> {
  const requested = options.limit ?? DEFAULT_PAGE_SIZE;
  const pageSize = Math.max(1, Math.min(requested, MAX_PAGE_SIZE));
  const createdAt = buildCreatedAtFilter(options);

  const logs = await prisma.auditLog.findMany({
    where: {
      entity: "Warehouse",
      entityId: id,
      ...(createdAt ? { createdAt } : {}),
    },
    include: { employee: { select: { firstName: true, lastName: true } } },
    orderBy: { id: "desc" },
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    take: pageSize + 1,
  });

  const hasMore = logs.length > pageSize;
  const pageLogs = hasMore ? logs.slice(0, pageSize) : logs;
  const nextCursor = hasMore ? pageLogs[pageLogs.length - 1]?.id ?? null : null;

  return {
    rows: pageLogs.map((log) => {
      const mapped: WarehouseHistoryRow = {
        id: log.id,
        action: log.action,
        actorName: log.employee ? `${log.employee.firstName} ${log.employee.lastName}` : "Sistema",
        oldValue: log.oldValue,
        newValue: log.newValue,
        createdAt: log.createdAt.toISOString(),
      };

      const compact = compactPayload(mapped);

      return {
        ...mapped,
        oldValue: compact.oldValue,
        newValue: compact.newValue,
      };
    }),
    nextCursor,
    hasMore,
  };
}
