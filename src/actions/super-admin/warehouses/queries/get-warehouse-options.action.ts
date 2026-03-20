"use server";

import { prisma } from "@/lib/prisma";

import type { WarehouseOptionBranch, WarehouseOptionManager } from "../types/warehouse";

export async function getWarehouseOptions(): Promise<{
  branches: WarehouseOptionBranch[];
  managers: WarehouseOptionManager[];
}> {
  const [branches, managers] = await Promise.all([
    prisma.branch.findMany({
      select: { id: true, name: true, city: true },
      orderBy: { name: "asc" },
    }),
    prisma.employee.findMany({
      where: { deletedAt: null, role: { code: { in: ["MANAGER", "ADMIN"] } } },
      select: { id: true, firstName: true, lastName: true, ci: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
  ]);

  return {
    branches,
    managers: managers.map((item) => ({
      id: item.id,
      fullName: `${item.firstName} ${item.lastName}`,
      ci: item.ci,
    })),
  };
}
