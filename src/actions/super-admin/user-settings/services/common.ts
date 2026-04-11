import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function ensureSuperAdminSession() {
  const session = await getSession();
  if (!session || session.roleCode !== "SUPERADMIN") {
    return null;
  }
  return session;
}

export function plusThreeMonths(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 3, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()));
}

async function getChangeWindow(entity: string, entityId: number) {
  const lastAudit = await prisma.auditLog.findFirst({
    where: {
      entity,
      entityId,
      action: "UPDATE",
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (!lastAudit) {
    return {
      canChange: true,
      lastChangeAt: null as Date | null,
      nextChangeAt: null as Date | null,
    };
  }

  const nextChangeAt = plusThreeMonths(lastAudit.createdAt);
  return {
    canChange: new Date() >= nextChangeAt,
    lastChangeAt: lastAudit.createdAt,
    nextChangeAt,
  };
}

export async function getCredentialChangeWindow(authId: number) {
  const window = await getChangeWindow("SuperAdminCredentials", authId);
  return {
    canChange: window.canChange,
    lastCredentialChangeAt: window.lastChangeAt,
    nextCredentialChangeAt: window.nextChangeAt,
  };
}

export async function getPersonalProfileEditWindow(employeeId: number) {
  const window = await getChangeWindow("SuperAdminProfilePersonal", employeeId);
  return {
    canEdit: window.canChange,
    lastProfileEditAt: window.lastChangeAt,
    nextProfileEditAt: window.nextChangeAt,
  };
}

export async function getCompetenciesProfileEditWindow(employeeId: number) {
  const window = await getChangeWindow("SuperAdminProfileCompetencies", employeeId);
  return {
    canEdit: window.canChange,
    lastProfileEditAt: window.lastChangeAt,
    nextProfileEditAt: window.nextChangeAt,
  };
}

export async function getProfileEditWindow(employeeId: number) {
  const [personalWindow, competenciesWindow] = await Promise.all([
    getPersonalProfileEditWindow(employeeId),
    getCompetenciesProfileEditWindow(employeeId),
  ]);

  const nextProfileEditAtCandidates = [
    personalWindow.nextProfileEditAt,
    competenciesWindow.nextProfileEditAt,
  ].filter((value): value is Date => Boolean(value));

  return {
    canEdit: personalWindow.canEdit && competenciesWindow.canEdit,
    lastProfileEditAt: personalWindow.lastProfileEditAt ?? competenciesWindow.lastProfileEditAt,
    nextProfileEditAt: nextProfileEditAtCandidates.length
      ? nextProfileEditAtCandidates.sort((a, b) => a.getTime() - b.getTime())[0]
      : null,
  };
}

export async function getOrCreateEmployeeSettings(employeeId: number) {
  const existing = await prisma.employeeSettings.findUnique({ where: { employeeId } });
  if (existing) return existing;
  return prisma.employeeSettings.create({ data: { employeeId } });
}
