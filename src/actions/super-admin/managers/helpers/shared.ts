import type { ManagerDetails, ManagerRow } from "@/actions/super-admin/managers/types";

type EmployeeWithRelations = {
  id: number;
  firstName: string;
  lastName: string;
  ci: string;
  phone: string | null;
  status: "ACTIVE" | "DEACTIVATED" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date | null;
  employeeProfile: {
    birthDate: Date | null;
    homeAddress: string | null;
  } | null;
  employeeEmployment: {
    salary: unknown;
    contributionType: "NONE" | "CONTRIBUTES" | "PAID";
    hireDate: Date;
  } | null;
  createdBy: { firstName: string; lastName: string } | null;
  updatedBy: { firstName: string; lastName: string } | null;
  role: { code: string };
  auth: { username: string; isActive: boolean };
  employeeBranches: {
    branch: { id: number; name: string; city: string };
  }[];
};

function decimalToNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (value && typeof value === "object" && "toNumber" in value && typeof (value as { toNumber: () => number }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value ?? 0);
}

export function serializeManager(employee: EmployeeWithRelations): ManagerRow {
  const fullName = `${employee.firstName} ${employee.lastName}`.trim();
  const salary = decimalToNumber(employee.employeeEmployment?.salary ?? 0);
  const receivesSalary = employee.employeeEmployment?.contributionType === "PAID" || salary > 0;

  return {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    fullName,
    ci: employee.ci,
    phone: employee.phone,
    email: employee.auth.username,
    salary,
    receivesSalary,
    homeAddress: employee.employeeProfile?.homeAddress ?? null,
    birthDate: employee.employeeProfile?.birthDate?.toISOString() ?? null,
    hireDate: employee.employeeEmployment?.hireDate?.toISOString() ?? employee.createdAt.toISOString(),
    status: employee.status,
    branches: employee.employeeBranches.map((item) => ({
      id: item.branch.id,
      name: item.branch.name,
      city: item.branch.city,
    })),
    createdAt: employee.createdAt.toISOString(),
    updatedAt: employee.updatedAt?.toISOString() ?? null,
    createdByName: employee.createdBy ? `${employee.createdBy.firstName} ${employee.createdBy.lastName}` : null,
    updatedByName: employee.updatedBy ? `${employee.updatedBy.firstName} ${employee.updatedBy.lastName}` : null,
  };
}

export function serializeManagerDetails(employee: EmployeeWithRelations): ManagerDetails {
  const base = serializeManager(employee);
  return {
    ...base,
    roleCode: employee.role.code,
    authActive: employee.auth.isActive,
  };
}

