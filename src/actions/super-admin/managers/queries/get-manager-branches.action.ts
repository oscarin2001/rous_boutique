"use server";

import type { ManagerBranchOption } from "@/actions/super-admin/managers/types";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getManagerBranchOptions(): Promise<ManagerBranchOption[]> {
  const session = await getSession();
  if (!session || session.roleCode !== "SUPERADMIN") return [];

  const branches = await prisma.branch.findMany({
    select: {
      id: true,
      name: true,
      city: true,
      employeeBranches: {
        where: {
          employee: {
            role: { code: "MANAGER" },
            deletedAt: null,
          },
        },
        select: { id: true },
      },
    },
    orderBy: [{ name: "asc" }],
  });

  return branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
    city: branch.city,
    assignedManagerCount: branch.employeeBranches.length,
  }));
}

