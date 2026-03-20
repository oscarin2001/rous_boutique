"use server";

import { revalidatePath } from "next/cache";

import {
  createBranchSchema,
  type CreateBranchInput,
} from "@/actions/super-admin/branches/schemas";
import type {
  BranchActionResult,
  BranchFormField,
} from "@/actions/super-admin/branches/types";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { createBranchAuditLog } from "../helpers/audit";
import { buildDefaultHours, serializeBranch } from "../helpers/shared";

const BRANCH_FORM_FIELDS = new Set<BranchFormField>([
  "name",
  "nit",
  "phone",
  "address",
  "city",
  "department",
  "country",
  "googleMaps",
  "managerId",
  "openedAt",
]);

export async function createBranch(
  data: CreateBranchInput
): Promise<BranchActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "No autorizado" };

  const parsed = createBranchSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<BranchFormField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && BRANCH_FORM_FIELDS.has(field as BranchFormField) && !fieldErrors[field as BranchFormField]) {
        fieldErrors[field as BranchFormField] = issue.message;
      }
    }
    return { success: false, error: parsed.error.issues[0].message, fieldErrors };
  }

  const { googleMaps, managerId, openedAt, ...rest } = parsed.data;

  let branchId: number;
  try {
    const branch = await prisma.$transaction(async (tx) => {
      const created = await tx.branch.create({
        data: {
          ...rest,
          googleMaps: googleMaps || null,
          openedAt: openedAt ?? null,
        },
      });

      await tx.branchHour.createMany({ data: buildDefaultHours(created.id) });

      if (managerId !== undefined) {
        const existingManagerAssignments = await tx.employeeBranch.findMany({
          where: {
            branchId: created.id,
            employee: { role: { code: "MANAGER" } },
          },
          select: { id: true },
        });

        if (existingManagerAssignments.length > 0) {
          await tx.employeeBranch.deleteMany({
            where: { id: { in: existingManagerAssignments.map((row) => row.id) } },
          });
        }

        if (managerId !== null) {
          const manager = await tx.employee.findUnique({
            where: { id: managerId },
            select: { id: true, role: { select: { code: true } } },
          });

          if (!manager || manager.role.code !== "MANAGER") {
            throw new Error("MANAGER_INVALID");
          }

          await tx.employeeBranch.create({
            data: {
              employeeId: managerId,
              branchId: created.id,
            },
          });
        }
      }

      await createBranchAuditLog(tx, {
        entityId: created.id,
        action: "CREATE",
        employeeId: session.employeeId,
        newValue: {
          name: created.name,
          city: created.city,
          department: created.department,
          country: created.country,
        },
      });

      return created.id;
    });
    branchId = branch;
  } catch {
    return {
      success: false,
      error: "Selecciona un gerente valido",
      fieldErrors: { managerId: "Selecciona un gerente valido" },
    };
  }

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
