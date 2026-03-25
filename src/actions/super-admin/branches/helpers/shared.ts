import type { BranchRow } from "@/actions/super-admin/branches/types";

type BranchWithRelations = {
  id: number;
  name: string;
  nit: string | null;
  phone: string | null;
  address: string;
  city: string;
  department: string | null;
  country: string;
  googleMaps: string | null;
  openedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  employees?: {
    id: number;
    firstName: string;
    lastName: string;
    role: { code: string };
  }[];
  employeeBranches?: {
    employee: {
      id: number;
      firstName: string;
      lastName: string;
      role: { code: string };
    };
  }[];
  warehouseBranches?: {
    isPrimary: boolean;
    warehouse: {
      id: number;
      name: string;
      address: string;
      city: string;
      department: string | null;
    };
  }[];
  supplierBranches?: {
    supplier: {
      id: number;
      firstName: string;
      lastName: string;
      email: string | null;
    };
  }[];
  hours?: {
    dayOfWeek: number;
    openingMinutes: number | null;
    closingMinutes: number | null;
    isClosed: boolean;
  }[];
};

const DEFAULT_HOURS: Record<
  number,
  { openingMinutes: number | null; closingMinutes: number | null; isClosed: boolean }
> = {
  0: { openingMinutes: null, closingMinutes: null, isClosed: true },
  1: { openingMinutes: 540, closingMinutes: 1080, isClosed: false },
  2: { openingMinutes: 540, closingMinutes: 1080, isClosed: false },
  3: { openingMinutes: 540, closingMinutes: 1080, isClosed: false },
  4: { openingMinutes: 540, closingMinutes: 1080, isClosed: false },
  5: { openingMinutes: 540, closingMinutes: 1080, isClosed: false },
  6: { openingMinutes: 600, closingMinutes: 840, isClosed: false },
};

function minutesToTime(value: number | null): string | null {
  if (value === null) return null;
  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function serializeBranch(branch: BranchWithRelations): BranchRow {
  const managersById = new Map<number, { id: number; name: string }>();
  for (const employeeBranch of branch.employeeBranches ?? []) {
    const employee = employeeBranch.employee;
    if (employee.role.code !== "MANAGER") continue;
    managersById.set(employee.id, {
      id: employee.id,
      name: `${employee.firstName} ${employee.lastName}`,
    });
  }
  for (const employee of branch.employees ?? []) {
    if (employee.role.code !== "MANAGER") continue;
    if (managersById.has(employee.id)) continue;
    managersById.set(employee.id, {
      id: employee.id,
      name: `${employee.firstName} ${employee.lastName}`,
    });
  }

  const managers = Array.from(managersById.values());
  const manager = managers[0] ?? null;

  const employeeIds = new Set<number>();
  for (const employee of branch.employees ?? []) employeeIds.add(employee.id);
  for (const employeeBranch of branch.employeeBranches ?? []) {
    employeeIds.add(employeeBranch.employee.id);
  }

  const warehouses = (branch.warehouseBranches ?? []).map((warehouseBranch) => ({
    id: warehouseBranch.warehouse.id,
    name: warehouseBranch.warehouse.name,
    address: warehouseBranch.warehouse.address,
    city: warehouseBranch.warehouse.city,
    department: warehouseBranch.warehouse.department,
    isPrimary: warehouseBranch.isPrimary,
  }));

  const suppliers = (branch.supplierBranches ?? []).map((supplierBranch) => ({
    id: supplierBranch.supplier.id,
    name: `${supplierBranch.supplier.firstName} ${supplierBranch.supplier.lastName}`,
    email: supplierBranch.supplier.email,
  }));

  return {
    id: branch.id,
    name: branch.name,
    nit: branch.nit,
    phone: branch.phone,
    address: branch.address,
    city: branch.city,
    department: branch.department,
    country: branch.country,
    googleMaps: branch.googleMaps,
    manager,
    managers,
    warehouses,
    suppliers,
    openedAt: branch.openedAt?.toISOString() ?? null,
    createdAt: branch.createdAt.toISOString(),
    updatedAt: branch.updatedAt?.toISOString() ?? null,
    createdByName: null,
    updatedByName: null,
    employeeCount: employeeIds.size,
    hours: (branch.hours ?? []).map((h) => ({
      dayOfWeek: h.dayOfWeek,
      openingTime: minutesToTime(h.openingMinutes),
      closingTime: minutesToTime(h.closingMinutes),
      isClosed: h.isClosed,
    })),
  };
}

export function buildDefaultHours(branchId: number) {
  return Array.from({ length: 7 }, (_, day) => ({
    branchId,
    dayOfWeek: day,
    openingMinutes: DEFAULT_HOURS[day].openingMinutes,
    closingMinutes: DEFAULT_HOURS[day].closingMinutes,
    isClosed: DEFAULT_HOURS[day].isClosed,
  }));
}

export function dayRange(date = new Date()) {
  const from = new Date(date);
  from.setHours(0, 0, 0, 0);

  const to = new Date(date);
  to.setHours(23, 59, 59, 999);

  return { from, to };
}
