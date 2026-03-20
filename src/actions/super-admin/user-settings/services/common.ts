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

export async function getCredentialChangeWindow(authId: number) {
  const lastCredentialAudit = await prisma.auditLog.findFirst({
    where: {
      entity: "SuperAdminCredentials",
      entityId: authId,
      action: "UPDATE",
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (!lastCredentialAudit) {
    return {
      canChange: true,
      lastCredentialChangeAt: null as Date | null,
      nextCredentialChangeAt: null as Date | null,
    };
  }

  const nextCredentialChangeAt = plusThreeMonths(lastCredentialAudit.createdAt);
  return {
    canChange: new Date() >= nextCredentialChangeAt,
    lastCredentialChangeAt: lastCredentialAudit.createdAt,
    nextCredentialChangeAt,
  };
}

export async function getOrCreateEmployeeSettings(employeeId: number) {
  const existing = await prisma.employeeSettings.findUnique({ where: { employeeId } });
  if (existing) return existing;
  return prisma.employeeSettings.create({ data: { employeeId } });
}
