"use server";

import type { BranchManagerOption } from "@/actions/super-admin/branches/types";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getBranchManagers(): Promise<BranchManagerOption[]> {
  const session = await getSession();
  if (!session) return [];

  const managers = await prisma.employee.findMany({
    where: {
      role: { code: "MANAGER" },
      deletedAt: null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      employeeBranches: {
        select: {
          branchId: true,
          branch: { select: { name: true } },
        },
        orderBy: { assignedAt: "asc" },
      },
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  return managers.map((manager) => {
    const firstAssignment = manager.employeeBranches[0];
    return {
      id: manager.id,
      name: `${manager.firstName} ${manager.lastName}`,
      assignedBranchId: firstAssignment?.branchId ?? null,
      assignedBranchName: firstAssignment?.branch.name ?? null,
    };
  });
}

