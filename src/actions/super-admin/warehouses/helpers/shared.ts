import type { WarehouseRow } from "../types/warehouse";

type WarehouseSource = {
  id: number;
  name: string;
  phone: string | null;
  address: string;
  city: string;
  department: string | null;
  country: string;
  openedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  managers: Array<{ employee: { id: number; firstName: string; lastName: string; ci: string } }>;
  warehouseBranches: Array<{ branch: { id: number; name: string; city: string } }>;
};

export function serializeWarehouse(item: WarehouseSource): WarehouseRow {
  return {
    id: item.id,
    name: item.name,
    phone: item.phone,
    address: item.address,
    city: item.city,
    department: item.department,
    country: item.country,
    openedAt: item.openedAt?.toISOString().slice(0, 10) ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt?.toISOString() ?? null,
    createdByName: null,
    updatedByName: null,
    managers: item.managers.map((it) => ({
      id: it.employee.id,
      fullName: `${it.employee.firstName} ${it.employee.lastName}`,
      ci: it.employee.ci,
    })),
    branches: item.warehouseBranches.map((it) => ({
      id: it.branch.id,
      name: it.branch.name,
      city: it.branch.city,
    })),
  };
}
