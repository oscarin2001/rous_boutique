"use server";

import { revalidatePath } from "next/cache";

import type { BranchActionResult } from "@/actions/super-admin/branches/types";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { createBranchAuditLog } from "../helpers/audit";
import { dayRange, serializeBranch } from "../helpers/shared";

export async function toggleBranchTodayStatus(
  branchId: number,
  closeToday: boolean
): Promise<BranchActionResult> {
  const session = await getSession();
  if (!session || session.roleCode !== "SUPERADMIN") return { success: false, error: "No autorizado" };

  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) return { success: false, error: "Sucursal no encontrada" };

  const { from, to } = dayRange();
  const specialDay = await prisma.branchSpecialDay.findFirst({
    where: {
      branchId,
      date: { gte: from, lte: to },
    },
  });

  const today = new Date().getDay();
  const todayHour = await prisma.branchHour.findUnique({
    where: { branchId_dayOfWeek: { branchId, dayOfWeek: today } },
  });

  if (closeToday) {
    if (specialDay) {
      await prisma.branchSpecialDay.update({
        where: { id: specialDay.id },
        data: { isClosed: true },
      });
    } else {
      await prisma.branchSpecialDay.create({
        data: {
          branchId,
          date: from,
          isClosed: true,
          notes: "Cierre operativo manual",
        },
      });
    }

    if (todayHour && !todayHour.isClosed) {
      await prisma.branchHour.update({
        where: { branchId_dayOfWeek: { branchId, dayOfWeek: today } },
        data: { isClosed: true },
      });
    }
  } else if (specialDay) {
    await prisma.branchSpecialDay.delete({ where: { id: specialDay.id } });

    if (todayHour && todayHour.isClosed) {
      await prisma.branchHour.update({
        where: { branchId_dayOfWeek: { branchId, dayOfWeek: today } },
        data: {
          openingMinutes: todayHour.openingMinutes ?? 540,
          closingMinutes: todayHour.closingMinutes ?? 1080,
          isClosed: false,
        },
      });
    }
  }

  await createBranchAuditLog(prisma, {
    entityId: branchId,
    action: "UPDATE",
    employeeId: session.employeeId,
    newValue: {
      operation: closeToday ? "CLOSE_TODAY" : "REOPEN_TODAY",
      date: from.toISOString().slice(0, 10),
    },
  });

  const hydrated = await prisma.branch.findUnique({
    where: { id: branchId },
    include: {
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
        orderBy: [{ isPrimary: "desc" }, { assignedAt: "asc" }],
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
        orderBy: { assignedAt: "asc" },
      },
      hours: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  revalidatePath("/dashboard/branches");
  return hydrated
    ? { success: true, branch: serializeBranch(hydrated) }
    : { success: true };
}
