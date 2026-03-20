"use server";

import type { ManagerDetails } from "@/actions/super-admin/managers/types";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { serializeManagerDetails } from "../helpers/shared";

export async function getManagerById(id: number): Promise<ManagerDetails | null> {
  const session = await getSession();
  if (!session) return null;

  const manager = await prisma.employee.findUnique({
    where: { id },
    include: {
      role: { select: { code: true } },
      auth: { select: { username: true, isActive: true } },
      createdBy: { select: { firstName: true, lastName: true } },
      updatedBy: { select: { firstName: true, lastName: true } },
      employeeBranches: {
        select: {
          branch: { select: { id: true, name: true, city: true } },
        },
        orderBy: { assignedAt: "asc" },
      },
    },
  });

  if (!manager || manager.role.code !== "MANAGER" || manager.deletedAt) return null;
  return serializeManagerDetails(manager);
}

