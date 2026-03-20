"use server";

import { revalidatePath } from "next/cache";

import { updateBranchSchema } from "@/actions/super-admin/branches/schemas";
import type {
  BranchActionResult,
  BranchFormField,
} from "@/actions/super-admin/branches/types";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { createBranchAuditLog } from "../helpers/audit";
import { verifySessionPassword } from "../helpers/security";
import { serializeBranch } from "../helpers/shared";

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
  "confirmPassword",
  "openedAt",
]);

export async function updateBranch(
  id: number,
  data: Record<string, unknown>
): Promise<BranchActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "No autorizado" };

  const confirmPassword =
    typeof data.confirmPassword === "string" ? data.confirmPassword : "";
  const validPassword = await verifySessionPassword(session, confirmPassword);
  if (!validPassword) {
    return {
      success: false,
      error: "Contraseña de confirmación inválida",
      fieldErrors: { confirmPassword: "Contraseña inválida" },
    };
  }

  const parsed = updateBranchSchema.safeParse(data);
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

  const existing = await prisma.branch.findUnique({
    where: { id },
    include: {
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
          warehouse: { select: { id: true, name: true } },
          isPrimary: true,
        },
      },
    },
  });
  if (!existing) return { success: false, error: "Sucursal no encontrada" };

  const { googleMaps, managerId, openedAt, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };

  if (googleMaps !== undefined) updateData.googleMaps = googleMaps || null;
  if (openedAt !== undefined) updateData.openedAt = openedAt ?? null;

  if (managerId !== undefined) {
    const managerAssignments = await prisma.employeeBranch.findMany({
      where: {
        branchId: id,
        employee: { role: { code: "MANAGER" } },
      },
      select: { id: true },
    });

    if (managerAssignments.length > 0) {
      await prisma.employeeBranch.deleteMany({
        where: { id: { in: managerAssignments.map((row) => row.id) } },
      });
    }

    if (managerId !== null) {
      const manager = await prisma.employee.findUnique({
        where: { id: managerId },
        select: { id: true, role: { select: { code: true } } },
      });

      if (!manager || manager.role.code !== "MANAGER") {
        return { success: false, error: "Selecciona un gerente valido", fieldErrors: { managerId: "Selecciona un gerente valido" } };
      }

      await prisma.employeeBranch.create({
        data: {
          employeeId: managerId,
          branchId: id,
        },
      });
    }
  }

  const branch = await prisma.branch.update({
    where: { id },
    data: updateData,
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

  await createBranchAuditLog(prisma, {
    entityId: id,
    action: "UPDATE",
    employeeId: session.employeeId,
    oldValue: {
      name: existing.name,
      city: existing.city,
      department: existing.department,
      managers: existing.employeeBranches
        .filter((item) => item.employee.role.code === "MANAGER")
        .map((item) => ({ id: item.employee.id, name: `${item.employee.firstName} ${item.employee.lastName}` })),
      warehouses: existing.warehouseBranches.map((item) => ({ id: item.warehouse.id, name: item.warehouse.name })),
    },
    newValue: {
      name: branch.name,
      city: branch.city,
      department: branch.department,
      managers: branch.employeeBranches
        .filter((item) => item.employee.role.code === "MANAGER")
        .map((item) => ({ id: item.employee.id, name: `${item.employee.firstName} ${item.employee.lastName}` })),
      warehouses: branch.warehouseBranches.map((item) => ({ id: item.warehouse.id, name: item.warehouse.name })),
    },
  });

  revalidatePath("/dashboard/branches");
  return { success: true, branch: serializeBranch(branch) };
}
