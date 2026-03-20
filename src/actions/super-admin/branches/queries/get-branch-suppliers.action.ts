"use server";

import type { BranchSupplierOption } from "@/actions/super-admin/branches/types";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getBranchSuppliers(): Promise<BranchSupplierOption[]> {
  const session = await getSession();
  if (!session) return [];

  const suppliers = await prisma.supplier.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      branches: {
        select: {
          branchId: true,
          branch: { select: { name: true } },
        },
        orderBy: { assignedAt: "asc" },
      },
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  return suppliers.map((supplier) => {
    const firstAssignment = supplier.branches[0];
    return {
      id: supplier.id,
      name: `${supplier.firstName} ${supplier.lastName}`,
      email: supplier.email,
      assignedBranchId: firstAssignment?.branchId ?? null,
      assignedBranchName: firstAssignment?.branch.name ?? null,
    };
  });
}

