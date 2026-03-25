"use server";

import bcrypt from "bcryptjs";

import { revalidatePath } from "next/cache";

import { createManagerSchema } from "@/actions/super-admin/managers/schemas";
import type { ManagerActionResult, ManagerFormField } from "@/actions/super-admin/managers/types";

import { ADMIN_VALIDATION_MESSAGES } from "@/lib/admin-validation-messages";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { createManagerAuditLog } from "../helpers/audit";
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
]);

const MAX_MANAGERS_PER_BRANCH = 2;

export async function createManager(data: Record<string, unknown>): Promise<ManagerActionResult> {
  const session = await getSession();
  if (!session || session.roleCode !== "SUPERADMIN") return { success: false, error: "No autorizado" };

  const parsed = createManagerSchema.safeParse(data);
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

  const role = await prisma.role.findUnique({ where: { code: "MANAGER" } });
  if (!role) return { success: false, error: "Rol MANAGER no configurado" };

  const emailExists = await prisma.auth.findUnique({ where: { username: parsed.data.email } });
  if (emailExists) return { success: false, error: "El correo ya existe", fieldErrors: { email: "El correo ya existe" } };

  const ciExists = await prisma.employee.findUnique({ where: { ci: parsed.data.ci } });
  if (ciExists) return { success: false, error: "La CI ya existe", fieldErrors: { ci: "La CI ya existe" } };

  const branchIds = Array.from(new Set((parsed.data.branchIds ?? []).filter((id) => Number.isInteger(id) && id > 0)));
  if (branchIds.length > 0) {
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

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const created = await prisma.$transaction(async (tx) => {
    const auth = await tx.auth.create({
      data: {
        username: parsed.data.email,
        password: passwordHash,
        accountType: "EMPLOYEE",
        isActive: true,
      },
    });

    const employee = await tx.employee.create({
      data: {
        authId: auth.id,
        roleId: role.id,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        ci: parsed.data.ci,
        phone: parsed.data.phone || null,
        branchId: branchIds[0] ?? null,
        status: "ACTIVE",
        createdById: session.employeeId,
      },
    });

    await tx.employeeProfile.create({
      data: {
        employeeId: employee.id,
        birthDate: parsed.data.birthDate,
        homeAddress: parsed.data.homeAddress || null,
      },
    });

    await tx.employeeEmployment.create({
      data: {
        employeeId: employee.id,
        salary: parsed.data.receivesSalary ? parsed.data.salary ?? 0 : 0,
        contributionType: parsed.data.receivesSalary ? "PAID" : "NONE",
        hireDate: parsed.data.hireDate,
      },
    });

    if (branchIds.length > 0) {
      await tx.employeeBranch.createMany({
        data: branchIds.map((branchId) => ({ employeeId: employee.id, branchId })),
      });
    }

    const hydrated = await tx.employee.findUniqueOrThrow({
      where: { id: employee.id },
      include: {
        role: { select: { code: true } },
        auth: { select: { username: true, isActive: true } },
        employeeProfile: { select: { birthDate: true, homeAddress: true } },
        employeeEmployment: { select: { salary: true, contributionType: true, hireDate: true } },
        createdBy: { select: { firstName: true, lastName: true } },
        updatedBy: { select: { firstName: true, lastName: true } },
        employeeBranches: {
          select: { branch: { select: { id: true, name: true, city: true } } },
          orderBy: { assignedAt: "asc" },
        },
      },
    });

    await createManagerAuditLog(tx, {
      entityId: hydrated.id,
      action: "CREATE",
      employeeId: session.employeeId,
      newValue: {
        firstName: hydrated.firstName,
        lastName: hydrated.lastName,
        ci: hydrated.ci,
        email: hydrated.auth.username,
        birthDate: hydrated.employeeProfile?.birthDate?.toISOString() ?? null,
        receivesSalary: hydrated.employeeEmployment?.contributionType === "PAID",
        salary: hydrated.employeeEmployment?.salary ?? 0,
        branchIds,
      },
    });

    return hydrated;
  });

  revalidatePath("/dashboard/managers");
  revalidatePath("/dashboard/branches");
  return { success: true, manager: serializeManager(created) };
}

