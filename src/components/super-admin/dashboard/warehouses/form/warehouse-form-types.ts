import type { WarehouseFormField } from "@/actions/super-admin/warehouses/types";

export type WarehouseDraft = {
  name: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  country: string;
  openedAt: string;
  branchIds: number[];
  managerIds: number[];
};

export type FieldErrors = Partial<Record<WarehouseFormField, string>>;
export type ChangeItem = { label: string; from: string; to: string };

