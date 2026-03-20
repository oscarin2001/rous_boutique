"use server";

import bcrypt from "bcryptjs";

import { revalidatePath } from "next/cache";

import { updateManagerSchema } from "@/actions/super-admin/managers/schemas";
import type { ManagerActionResult, ManagerFormField } from "@/actions/super-admin/managers/types";

import { ADMIN_VALIDATION_MESSAGES } from "@/lib/admin-validation-messages";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { createManagerAuditLog } from "../helpers/audit";
import { verifySessionPassword } from "../helpers/security";
import { serializeManager } from "../helpers/shared";

const MANAGER_FORM_FIELDS = new Set<ManagerFormField>([
  "firstName",
  "lastName",
  "ci",
  "phone",
  "email",
  "password",
  "passwordConfirm",
  "receivesSalary",
  "salary",
  "homeAddress",
  "birthDate",
  "hireDate",
  "branchIds",
  "adminConfirmPassword",
]);

const MAX_MANAGERS_PER_BRANCH = 2;

export async function updateManager(id: number, data: Record<string, unknown>): Promise<ManagerActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "No autorizado" };

  const adminConfirmPassword = typeof data.adminConfirmPassword === "string" ? data.adminConfirmPassword : "";
  const validPassword = await verifySessionPassword(session, adminConfirmPassword);
  if (!validPassword) {
    return {
      success: false,
      error: "Contraseña de confirmación inválida",
      fieldErrors: { adminConfirmPassword: "Contraseña inválida" },
    };
  }

  const parsed = updateManagerSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<ManagerFormField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && MANAGER_FORM_FIELDS.has(field as ManagerFormField) && !fieldErrors[field as ManagerFormField]) {
        fieldErrors[field as ManagerFormField] = issue.message;
      }
    }
    return { success: false, error: parsed.error.issues[0].message, fieldErrors };
  }

  const existing = await prisma.employee.findUnique({
    where: { id },
    include: {
      role: { select: { code: true } },
      auth: { select: { id: true, username: true, isActive: true } },
      employeeBranches: { select: { branchId: true } },
    },
  });

  if (!existing || existing.role.code !== "MANAGER" || existing.deletedAt) {
    return { success: false, error: "Encargado no encontrado" };
  }

  const payload = parsed.data;

  if (payload.email && payload.email !== existing.auth.username) {
    const emailExists = await prisma.auth.findUnique({ where: { username: payload.email } });
    if (emailExists) return { success: false, error: "El correo ya existe", fieldErrors: { email: "El correo ya existe" } };
  }

  if (payload.ci && payload.ci !== existing.ci) {
    const ciExists = await prisma.employee.findFirst({ where: { ci: payload.ci, id: { not: id } } });
    if (ciExists) return { success: false, error: "La CI ya existe", fieldErrors: { ci: "La CI ya existe" } };
  }

  const branchIds = payload.branchIds
    ? Array.from(new Set(payload.branchIds.filter((item) => Number.isInteger(item) && item > 0)))
    : undefined;

  if (branchIds && branchIds.length > 0) {
    const branches = await prisma.branch.findMany({ where: { id: { in: branchIds } }, select: { id: true } });
    if (branches.length !== branchIds.length) {
      return { success: false, error: "Una o mas sucursales son invalidas", fieldErrors: { branchIds: "Selecciona sucursales validas" } };
    }

    const branchLoads = await prisma.branch.findMany({
      where: { id: { in: branchIds } },
      select: {
        id: true,
        name: true,
        city: true,
        employeeBranches: {
          where: {
            employee: {
              role: { code: "MANAGER" },
              deletedAt: null,
              id: { not: id },
            },
          },
          select: { id: true },
        },
      },
    });

    const saturated = branchLoads.find((branch) => branch.employeeBranches.length >= MAX_MANAGERS_PER_BRANCH);
    if (saturated) {
      return {
        success: false,
        error: `La sucursal ${saturated.name} (${saturated.city}) ya tiene ${MAX_MANAGERS_PER_BRANCH} encargados asignados`,
        fieldErrors: { branchIds: ADMIN_VALIDATION_MESSAGES.maxManagersPerBranch },
      };
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const { email, password, branchIds, ...employeeData } = payload;

    const receivesSalary = employeeData.receivesSalary;
    const salary = employeeData.salary;

    await tx.employee.update({
      where: { id },
      data: {
        ...employeeData,
        contributionType:
          receivesSalary === undefined
            ? undefined
            : receivesSalary
              ? "PAID"
              : "NONE",
        salary:
          receivesSalary === undefined
            ? salary
            : receivesSalary
              ? salary
              : 0,
        phone: employeeData.phone === "" ? null : employeeData.phone,
        homeAddress: employeeData.homeAddress === "" ? null : employeeData.homeAddress,
        updatedById: session.employeeId,
      },
    });

    if (email !== undefined) {
      await tx.auth.update({ where: { id: existing.auth.id }, data: { username: email } });
    }

    if (password && password.trim()) {
      const passwordHash = await bcrypt.hash(password, 12);
      await tx.auth.update({ where: { id: existing.auth.id }, data: { password: passwordHash } });
    }

    if (branchIds !== undefined) {
      await tx.employeeBranch.deleteMany({ where: { employeeId: id } });
      if (branchIds.length > 0) {
        await tx.employeeBranch.createMany({
          data: branchIds.map((branchId) => ({ employeeId: id, branchId })),
        });
      }
    }

    const hydrated = await tx.employee.findUniqueOrThrow({
      where: { id },
      include: {
        role: { select: { code: true } },
        auth: { select: { username: true, isActive: true } },
        createdBy: { select: { firstName: true, lastName: true } },
        updatedBy: { select: { firstName: true, lastName: true } },
        employeeBranches: {
          select: { branch: { select: { id: true, name: true, city: true } } },
          orderBy: { assignedAt: "asc" },
        },
      },
    });

    await createManagerAuditLog(tx, {
      entityId: id,
      action: "UPDATE",
      employeeId: session.employeeId,
      oldValue: {
        firstName: existing.firstName,
        lastName: existing.lastName,
        ci: existing.ci,
        email: existing.auth.username,
        birthDate: existing.birthDate?.toISOString() ?? null,
        receivesSalary: existing.contributionType === "PAID" || Number(existing.salary) > 0,
        salary: existing.salary,
        branchIds: existing.employeeBranches.map((item) => item.branchId),
      },
      newValue: {
        firstName: hydrated.firstName,
        lastName: hydrated.lastName,
        ci: hydrated.ci,
        email: hydrated.auth.username,
        birthDate: hydrated.birthDate?.toISOString() ?? null,
        receivesSalary: hydrated.contributionType === "PAID" || Number(hydrated.salary) > 0,
        salary: hydrated.salary,
        branchIds: hydrated.employeeBranches.map((item) => item.branch.id),
      },
    });

    return hydrated;
  });

  revalidatePath("/dashboard/managers");
  revalidatePath("/dashboard/branches");
  return { success: true, manager: serializeManager(updated) };
}

