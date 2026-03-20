"use server";

import type { BranchWarehouseOption } from "@/actions/super-admin/branches/types";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getBranchWarehouses(): Promise<BranchWarehouseOption[]> {
  const session = await getSession();
  if (!session) return [];

  const warehouses = await prisma.warehouse.findMany({
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      department: true,
      warehouseBranches: {
        select: {
          branchId: true,
          branch: { select: { name: true } },
        },
        orderBy: { assignedAt: "asc" },
      },
    },
    orderBy: [{ name: "asc" }],
  });

  return warehouses.map((warehouse) => {
    const firstAssignment = warehouse.warehouseBranches[0];
    return {
      id: warehouse.id,
      name: warehouse.name,
      address: warehouse.address,
      city: warehouse.city,
      department: warehouse.department,
      assignedBranchId: firstAssignment?.branchId ?? null,
      assignedBranchName: firstAssignment?.branch.name ?? null,
    };
  });
}

