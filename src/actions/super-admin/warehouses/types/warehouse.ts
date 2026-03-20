export type WarehouseFormField =
  | "name"
  | "phone"
  | "address"
  | "city"
  | "department"
  | "country"
  | "openedAt"
  | "branchIds"
  | "managerIds"
  | "confirmPassword";

export interface WarehouseRelationBranch {
  id: number;
  name: string;
  city: string;
}

export interface WarehouseRelationManager {
  id: number;
  fullName: string;
  ci: string;
}

export interface WarehouseRow {
  id: number;
  name: string;
  phone: string | null;
  address: string;
  city: string;
  department: string | null;
  country: string;
  openedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  createdByName: string | null;
  updatedByName: string | null;
  branches: WarehouseRelationBranch[];
  managers: WarehouseRelationManager[];
}

export interface WarehouseMetrics {
  total: number;
  withManagers: number;
  withoutManagers: number;
  withBranches: number;
  withoutBranches: number;
}

export interface WarehouseHistoryRow {
  id: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  actorName: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface WarehouseOptionBranch {
  id: number;
  name: string;
  city: string;
}

export interface WarehouseOptionManager {
  id: number;
  fullName: string;
  ci: string;
}

export type WarehouseActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<WarehouseFormField, string>>;
  warehouse?: WarehouseRow;
};
