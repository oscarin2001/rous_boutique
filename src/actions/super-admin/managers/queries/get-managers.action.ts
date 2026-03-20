"use server";

import type { ManagerMetrics, ManagerRow } from "@/actions/super-admin/managers/types";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { serializeManager } from "../helpers/shared";

const includeManager = {
  role: { select: { code: true } },
  auth: { select: { username: true, isActive: true } },
  createdBy: { select: { firstName: true, lastName: true } },
  updatedBy: { select: { firstName: true, lastName: true } },
  employeeBranches: {
    select: {
      branch: { select: { id: true, name: true, city: true } },
    },
    orderBy: { assignedAt: "asc" as const },
  },
};

export async function getManagers(): Promise<ManagerRow[]> {
  const session = await getSession();
  if (!session) return [];

  const managers = await prisma.employee.findMany({
    where: {
      role: { code: "MANAGER" },
      deletedAt: null,
    },
    include: includeManager,
    orderBy: [{ createdAt: "desc" }],
  });

  return managers.map(serializeManager);
}

export async function getManagersMetrics(): Promise<ManagerMetrics> {
  const session = await getSession();
  if (!session) {
    return {
      total: 0,
      active: 0,
      deactivated: 0,
      inactive: 0,
      withBranches: 0,
      withoutBranches: 0,
    };
  }

  const managers = await prisma.employee.findMany({
    where: {
      role: { code: "MANAGER" },
      deletedAt: null,
    },
    select: {
      status: true,
      employeeBranches: { select: { id: true } },
    },
  });

  const total = managers.length;
  const active = managers.filter((item) => item.status === "ACTIVE").length;
  const deactivated = managers.filter((item) => item.status === "DEACTIVATED").length;
  const inactive = managers.filter((item) => item.status === "INACTIVE").length;
  const withBranches = managers.filter((item) => item.employeeBranches.length > 0).length;

  return {
    total,
    active,
    deactivated,
    inactive,
    withBranches,
    withoutBranches: total - withBranches,
  };
}

