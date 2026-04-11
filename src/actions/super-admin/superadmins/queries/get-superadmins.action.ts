"use server";

import { prisma } from "@/lib/prisma";

import { ensureSuperAdminActor, mapSuperAdminRow, superAdminSelect } from "../helpers";
import type { SuperAdminRow } from "../types";

export async function getSuperAdmins(): Promise<SuperAdminRow[]> {
  const session = await ensureSuperAdminActor();
  if (!session) return [];

  const records = await prisma.employee.findMany({
    where: { deletedAt: null, role: { code: "SUPERADMIN" } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: superAdminSelect,
  });

  return records.map(mapSuperAdminRow);
}
