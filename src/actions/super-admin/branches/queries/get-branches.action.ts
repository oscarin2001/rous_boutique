"use server";

import type { BranchRow } from "@/actions/super-admin/branches/types";

import { prisma } from "@/lib/prisma";

import { serializeBranch } from "../helpers/shared";

async function getBranchAuditNames(branchIds: number[]) {
  const map = new Map<number, { createdByName: string | null; updatedByName: string | null }>();
  if (branchIds.length === 0) return map;

  const logs = await prisma.auditLog.findMany({
    where: {
      entity: "Branch",
      entityId: { in: branchIds },
      action: { in: ["CREATE", "UPDATE"] },
    },
    include: { employee: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });

  for (const log of logs) {
    const current = map.get(log.entityId) ?? { createdByName: null, updatedByName: null };
    const actorName = log.employee ? `${log.employee.firstName} ${log.employee.lastName}` : null;

    if (log.action === "UPDATE" && current.updatedByName === null) {
      current.updatedByName = actorName;
    }

    if (log.action === "CREATE" && current.createdByName === null) {
      current.createdByName = actorName;
    }

    map.set(log.entityId, current);
  }

  return map;
}

const includeBranch = {
  employees: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: { select: { code: true } },
    },
  },
  employeeBranches: {
    select: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: { select: { code: true } },
        },
      },
    },
  },
  warehouseBranches: {
    select: {
      isPrimary: true,
      warehouse: {
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          department: true,
        },
      },
    },
    orderBy: [{ isPrimary: "desc" as const }, { assignedAt: "asc" as const }],
  },
  supplierBranches: {
    select: {
      supplier: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { assignedAt: "asc" as const },
  },
  hours: { orderBy: { dayOfWeek: "asc" as const } },
};

export async function getBranches(): Promise<BranchRow[]> {
  const branches = await prisma.branch.findMany({
    include: includeBranch,
    orderBy: { createdAt: "asc" },
  });

  const auditMap = await getBranchAuditNames(branches.map((branch) => branch.id));

  return branches.map((branch) => {
    const serialized = serializeBranch(branch);
    const audit = auditMap.get(branch.id);
    return {
      ...serialized,
      createdByName: audit?.createdByName ?? null,
      updatedByName: audit?.updatedByName ?? null,
    };
  });
}

export async function getBranchById(id: number): Promise<BranchRow | null> {
  const branch = await prisma.branch.findUnique({
    where: { id },
    include: includeBranch,
  });

  if (!branch) return null;

  const serialized = serializeBranch(branch);
  const auditMap = await getBranchAuditNames([branch.id]);
  const audit = auditMap.get(branch.id);

  return {
    ...serialized,
    createdByName: audit?.createdByName ?? null,
    updatedByName: audit?.updatedByName ?? null,
  };
}
