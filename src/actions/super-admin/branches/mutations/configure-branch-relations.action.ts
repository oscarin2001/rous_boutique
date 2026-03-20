"use server";

import { revalidatePath } from "next/cache";

import type { BranchActionResult } from "@/actions/super-admin/branches/types";

import { ADMIN_VALIDATION_MESSAGES } from "@/lib/admin-validation-messages";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { createBranchAuditLog } from "../helpers/audit";
import { verifySessionPassword } from "../helpers/security";
import { serializeBranch } from "../helpers/shared";

type ConfigureInput = {
  managerIds: number[];
  warehouseIds: number[];
  supplierIds: number[];
  confirmPassword: string;
};

const MAX_MANAGERS_PER_BRANCH = 2;

export async function configureBranchRelations(
  branchId: number,
  data: ConfigureInput
): Promise<BranchActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "No autorizado" };

  const validPassword = await verifySessionPassword(session, data.confirmPassword);
  if (!validPassword) {
    return { success: false, error: "Contraseña de confirmación inválida" };
  }

  const managerIds = Array.from(new Set(data.managerIds.filter((id) => Number.isInteger(id) && id > 0)));
  const warehouseIds = Array.from(new Set(data.warehouseIds.filter((id) => Number.isInteger(id) && id > 0)));
  const supplierIds = Array.from(new Set(data.supplierIds.filter((id) => Number.isInteger(id) && id > 0)));

  if (managerIds.length > MAX_MANAGERS_PER_BRANCH) {
    return {
      success: false,
      error: `Una sucursal puede tener maximo ${MAX_MANAGERS_PER_BRANCH} encargados`,
      fieldErrors: { managerId: ADMIN_VALIDATION_MESSAGES.maxManagersPerBranch },
    };
  }

  const existing = await prisma.branch.findUnique({
    where: { id: branchId },
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
        },
      },
      supplierBranches: {
        select: {
          supplier: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });
  if (!existing) return { success: false, error: "Sucursal no encontrada" };

  if (managerIds.length > 0) {
    const validManagers = await prisma.employee.findMany({
      where: {
        id: { in: managerIds },
        role: { code: "MANAGER" },
        deletedAt: null,
      },
      select: { id: true },
    });
    if (validManagers.length !== managerIds.length) {
      return {
        success: false,
        error: "Uno o mas gerentes son invalidos",
        fieldErrors: { managerId: "Uno o mas gerentes son invalidos" },
      };
    }
  }

  if (warehouseIds.length > 0) {
    const validWarehouses = await prisma.warehouse.findMany({
      where: { id: { in: warehouseIds } },
      select: { id: true },
    });
    if (validWarehouses.length !== warehouseIds.length) {
      return { success: false, error: "Uno o mas almacenes son invalidos" };
    }
  }

  if (supplierIds.length > 0) {
    const validSuppliers = await prisma.supplier.findMany({
      where: { id: { in: supplierIds }, deletedAt: null, isActive: true },
      select: { id: true },
    });
    if (validSuppliers.length !== supplierIds.length) {
      return { success: false, error: "Uno o mas proveedores son invalidos" };
    }
  }

  await prisma.$transaction(async (tx) => {
    const managerEmployeeBranchIds = await tx.employeeBranch.findMany({
      where: {
        branchId,
        employee: { role: { code: "MANAGER" } },
      },
      select: { id: true },
    });

    if (managerEmployeeBranchIds.length > 0) {
      await tx.employeeBranch.deleteMany({
        where: { id: { in: managerEmployeeBranchIds.map((row) => row.id) } },
      });
    }

    if (managerIds.length > 0) {
      await tx.employeeBranch.createMany({
        data: managerIds.map((employeeId) => ({
          employeeId,
          branchId,
        })),
      });
    }

    await tx.warehouseBranch.deleteMany({ where: { branchId } });

    if (warehouseIds.length > 0) {
      await tx.warehouseBranch.createMany({
        data: warehouseIds.map((warehouseId, index) => ({
          warehouseId,
          branchId,
          isPrimary: index === 0,
        })),
      });
    }

    await tx.supplierBranch.deleteMany({ where: { branchId } });

    if (supplierIds.length > 0) {
      await tx.supplierBranch.createMany({
        data: supplierIds.map((supplierId) => ({
          supplierId,
          branchId,
        })),
      });
    }

    await createBranchAuditLog(tx, {
      entityId: branchId,
      action: "UPDATE",
      employeeId: session.employeeId,
      oldValue: {
        managers: existing.employeeBranches
          .filter((item) => item.employee.role.code === "MANAGER")
          .map((item) => ({ id: item.employee.id, name: `${item.employee.firstName} ${item.employee.lastName}` })),
        warehouses: existing.warehouseBranches.map((item) => ({
          id: item.warehouse.id,
          name: item.warehouse.name,
        })),
        suppliers: existing.supplierBranches.map((item) => ({
          id: item.supplier.id,
          name: `${item.supplier.firstName} ${item.supplier.lastName}`,
        })),
      },
      newValue: {
        managerIds,
        warehouseIds,
        supplierIds,
      },
    });
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
  return hydrated ? { success: true, branch: serializeBranch(hydrated) } : { success: true };
}

