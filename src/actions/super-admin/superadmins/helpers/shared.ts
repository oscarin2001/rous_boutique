import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import type { SuperAdminRow } from "../types";

const superAdminSelect = {
  id: true,
  authId: true,
  firstName: true,
  lastName: true,
  ci: true,
  phone: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { firstName: true, lastName: true } },
  updatedBy: { select: { firstName: true, lastName: true } },
  auth: { select: { username: true, lastLogin: true } },
  employeeProfile: { select: { birthDate: true } },
} as const;

type SuperAdminRecord = {
  id: number;
  authId: number;
  firstName: string;
  lastName: string;
  ci: string;
  phone: string | null;
  status: "ACTIVE" | "DEACTIVATED" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: { firstName: string; lastName: string } | null;
  updatedBy: { firstName: string; lastName: string } | null;
  auth: { username: string; lastLogin: Date | null };
  employeeProfile: { birthDate: Date | null } | null;
};

export async function ensureSuperAdminActor() {
  const session = await getSession();
  if (!session || session.roleCode !== "SUPERADMIN") return null;
  return session;
}

export async function verifyActorPassword(authId: number, adminConfirmPassword: string) {
  const auth = await prisma.auth.findUnique({
    where: { id: authId },
    select: { password: true },
  });
  if (!auth) return false;
  return bcrypt.compare(adminConfirmPassword, auth.password);
}

export async function getSuperAdminRoleId() {
  const role = await prisma.role.findUnique({
    where: { code: "SUPERADMIN" },
    select: { id: true },
  });
  return role?.id ?? null;
}

export async function getSuperAdminById(id: number) {
  return prisma.employee.findFirst({
    where: { id, deletedAt: null, role: { code: "SUPERADMIN" } },
    select: superAdminSelect,
  });
}

export function mapSuperAdminRow(record: SuperAdminRecord): SuperAdminRow {
  return {
    id: record.id,
    authId: record.authId,
    firstName: record.firstName,
    lastName: record.lastName,
    fullName: `${record.firstName} ${record.lastName}`.trim(),
    ci: record.ci,
    phone: record.phone ?? null,
    username: record.auth.username,
    status: record.status,
    birthDate: record.employeeProfile?.birthDate ? record.employeeProfile.birthDate.toISOString().slice(0, 10) : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt?.toISOString() ?? null,
    createdByName: record.createdBy ? `${record.createdBy.firstName} ${record.createdBy.lastName}` : null,
    updatedByName: record.updatedBy ? `${record.updatedBy.firstName} ${record.updatedBy.lastName}` : null,
    lastLoginAt: record.auth.lastLogin?.toISOString() ?? null,
  };
}

export async function countActiveSuperAdmins(excludeId?: number) {
  return prisma.employee.count({
    where: {
      deletedAt: null,
      role: { code: "SUPERADMIN" },
      status: "ACTIVE",
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export { superAdminSelect };
