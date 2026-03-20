"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { verifySessionPassword } from "../helpers/security";
import { createSupplierSchema, updateSupplierSchema } from "../schemas/supplier.schema";
import type { SupplierActionResult, SupplierFormField } from "../types/supplier";

const DASHBOARD_SUPPLIERS = "/dashboard/suppliers";

export async function saveSupplierAction(
  data: Record<string, unknown>,
  id?: number
): Promise<SupplierActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "No autorizado" };

    const validated = id
      ? updateSupplierSchema.safeParse(data)
      : createSupplierSchema.safeParse(data);

    if (!validated.success) {
      const fieldErrors: Partial<Record<SupplierFormField, string>> = {};
      for (const issue of validated.error.issues) {
        if (issue.path[0]) fieldErrors[issue.path[0] as SupplierFormField] = issue.message;
      }
      return { success: false, fieldErrors };
    }

    const { branchIds, managerIds, birthDate, partnerSince, contractEndAt, ...rawFields } = validated.data;
    const confirmPassword = typeof data.confirmPassword === "string" ? data.confirmPassword : "";

    if (id) {
      const validPassword = await verifySessionPassword(session, confirmPassword ?? "");
      if (!validPassword) {
        return {
          success: false,
          error: "Contrasena de confirmacion invalida",
          fieldErrors: { confirmPassword: "Contrasena invalida" },
        };
      }
    }

    const payload = {
      ...rawFields,
      birthDate: birthDate ? new Date(birthDate) : null,
      partnerSince: partnerSince ? new Date(partnerSince) : null,
      contractEndAt: contractEndAt ? new Date(contractEndAt) : null,
    };

    if (id) {
      await prisma.$transaction(async (tx) => {
        await tx.supplier.update({ where: { id }, data: { ...payload, isActive: payload.isActive ?? undefined } });

        if (branchIds !== undefined) {
          await tx.supplierBranch.deleteMany({ where: { supplierId: id } });
          if (branchIds.length) {
            await tx.supplierBranch.createMany({ data: branchIds.map((branchId) => ({ supplierId: id, branchId })) });
          }
        }

        if (managerIds !== undefined) {
          await tx.supplierManager.deleteMany({ where: { supplierId: id } });
          if (managerIds.length) {
            await tx.supplierManager.createMany({ data: managerIds.map((employeeId) => ({ supplierId: id, employeeId })) });
          }
        }

        await tx.auditLog.create({
          data: {
            entity: "Supplier",
            entityId: id,
            action: "UPDATE",
            employeeId: session.employeeId,
          },
        });
      });
    } else {
      const created = await prisma.supplier.create({
        data: {
          firstName: payload.firstName!,
          lastName: payload.lastName!,
          phone: payload.phone,
          email: payload.email,
          address: payload.address,
          city: payload.city,
          department: payload.department,
          country: payload.country,
          ci: payload.ci,
          notes: payload.notes,
          birthDate: payload.birthDate,
          partnerSince: payload.partnerSince,
          contractEndAt: payload.contractEndAt,
          isIndefinite: payload.isIndefinite,
          isActive: payload.isActive ?? true,
          branches: { create: (branchIds ?? []).map((branchId) => ({ branchId })) },
          managers: { create: (managerIds ?? []).map((employeeId) => ({ employeeId })) },
        },
      });

      await prisma.auditLog.create({
        data: {
          entity: "Supplier",
          entityId: created.id,
          action: "CREATE",
          employeeId: session.employeeId,
        },
      });
    }

    revalidatePath(DASHBOARD_SUPPLIERS);
    return { success: true };
  } catch (error) {
    console.error("Error saving supplier:", error);
    return { success: false, error: "Error al guardar el proveedor." };
  }
}
