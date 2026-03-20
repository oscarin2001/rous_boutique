"use server";

import { revalidatePath } from "next/cache";

import type { BranchActionResult } from "@/actions/super-admin/branches/types";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { createBranchAuditLog } from "../helpers/audit";
import { verifySessionPassword } from "../helpers/security";

export async function deleteBranch(
  id: number,
  confirmPassword: string
): Promise<BranchActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "No autorizado" };

  const validPassword = await verifySessionPassword(session, confirmPassword);
  if (!validPassword) {
    return { success: false, error: "Contraseña de confirmación inválida" };
  }

  const branch = await prisma.branch.findUnique({
    where: { id },
    include: {
      employees: { select: { id: true } },
      employeeBranches: { select: { id: true } },
      warehouseBranches: { select: { id: true } },
      supplierBranches: { select: { id: true } },
    },
  });

  if (!branch) return { success: false, error: "Sucursal no encontrada" };

  if (branch.employees.length > 0) {
    return {
      success: false,
      error: `No se puede eliminar: ${branch.employees.length} empleado(s) asignado(s)`,
    };
  }

  if (branch.employeeBranches.length > 0) {
    return {
      success: false,
      error: `No se puede eliminar: ${branch.employeeBranches.length} asignacion(es) de empleados`,
    };
  }

  if (branch.warehouseBranches.length > 0) {
    return {
      success: false,
      error: `No se puede eliminar: ${branch.warehouseBranches.length} almacen(es) asignado(s)`,
    };
  }

  if (branch.supplierBranches.length > 0) {
    return {
      success: false,
      error: `No se puede eliminar: ${branch.supplierBranches.length} proveedor(es) asignado(s)`,
    };
  }

  await createBranchAuditLog(prisma, {
    entityId: id,
    action: "DELETE",
    employeeId: session.employeeId,
    oldValue: {
      name: branch.name,
      city: branch.city,
      department: branch.department,
    },
  });

  await prisma.branchHour.deleteMany({ where: { branchId: id } });
  await prisma.branchSpecialDay.deleteMany({ where: { branchId: id } });
  await prisma.branch.delete({ where: { id } });

  revalidatePath("/dashboard/branches");
  return { success: true };
}
