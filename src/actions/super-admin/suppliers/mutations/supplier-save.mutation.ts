"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { enforceAdminPasswordCheck, enforceSensitiveActionRateLimit } from "../helpers/security";
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

    const rateLimitError = enforceSensitiveActionRateLimit(session);
    if (rateLimitError) return { success: false, error: rateLimitError };

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
      const passwordError = await enforceAdminPasswordCheck(session, confirmPassword, false);
      if (passwordError) {
        return {
          success: false,
          error: passwordError,
          fieldErrors: { confirmPassword: passwordError },
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
      // Get current supplier data for audit
      const currentSupplier = await prisma.supplier.findUnique({
        where: { id },
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          address: true,
          city: true,
          department: true,
          country: true,
          ci: true,
          notes: true,
          birthDate: true,
          partnerSince: true,
          contractEndAt: true,
          isIndefinite: true,
          isActive: true,
          branches: { select: { branchId: true } },
          managers: { select: { employeeId: true } }
        }
      });

      if (!currentSupplier) return { success: false, error: "Proveedor no encontrado" };

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

        // Create detailed audit log
        const changes: Record<string, { old: unknown; new: unknown }> = {};

        const fieldsToCheck = [
          'firstName', 'lastName', 'phone', 'email', 'address', 'city', 'department', 'country', 'ci', 'notes',
          'birthDate', 'partnerSince', 'contractEndAt', 'isIndefinite', 'isActive'
        ] as const;

        for (const field of fieldsToCheck) {
          if (payload[field] !== undefined && payload[field] !== currentSupplier[field]) {
            changes[field] = { old: currentSupplier[field], new: payload[field] };
          }
        }

        if (branchIds !== undefined) {
          const oldBranchIds = currentSupplier.branches.map(b => b.branchId).sort();
          const newBranchIds = branchIds.sort();
          if (JSON.stringify(oldBranchIds) !== JSON.stringify(newBranchIds)) {
            changes.branches = { old: oldBranchIds, new: newBranchIds };
          }
        }

        if (managerIds !== undefined) {
          const oldManagerIds = currentSupplier.managers.map(m => m.employeeId).sort();
          const newManagerIds = managerIds.sort();
          if (JSON.stringify(oldManagerIds) !== JSON.stringify(newManagerIds)) {
            changes.managers = { old: oldManagerIds, new: newManagerIds };
          }
        }

        await tx.auditLog.create({
          data: {
            entity: "Supplier",
            entityId: id,
            action: "UPDATE",
            oldValue: JSON.stringify(changes),
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
          newValue: JSON.stringify({
            name: `${payload.firstName} ${payload.lastName}`,
            phone: payload.phone,
            email: payload.email,
            address: payload.address,
            city: payload.city,
            department: payload.department,
            country: payload.country,
            ci: payload.ci,
            birthDate: payload.birthDate,
            partnerSince: payload.partnerSince,
            contractEndAt: payload.contractEndAt,
            isIndefinite: payload.isIndefinite,
            isActive: payload.isActive,
            branchCount: branchIds?.length ?? 0,
            managerCount: managerIds?.length ?? 0
          }),
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
