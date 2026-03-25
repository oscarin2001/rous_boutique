export interface BranchRow {
  id: number;
  name: string;
  nit: string | null;
  phone: string | null;
  address: string;
  city: string;
  department: string | null;
  country: string;
  googleMaps: string | null;
  manager: BranchManagerSummary | null;
  managers: BranchManagerSummary[];
  warehouses: BranchWarehouseSummary[];
  suppliers: BranchSupplierSummary[];
  openedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  createdByName: string | null;
  updatedByName: string | null;
  employeeCount: number;
  hours: BranchHourRow[];
}

export interface BranchManagerSummary {
  id: number;
  name: string;
}

export interface BranchManagerOption {
  id: number;
  name: string;
  assignedBranchId: number | null;
  assignedBranchName: string | null;
}

export interface BranchWarehouseSummary {
  id: number;
  name: string;
  address: string;
  city: string;
  department: string | null;
  isPrimary: boolean;
}

export interface BranchWarehouseOption {
  id: number;
  name: string;
  address: string;
  city: string;
  department: string | null;
  assignedBranchId: number | null;
  assignedBranchName: string | null;
}

export interface BranchSupplierSummary {
  id: number;
  name: string;
  email: string | null;
}

export interface BranchSupplierOption {
  id: number;
  name: string;
  email: string | null;
  assignedBranchId: number | null;
  assignedBranchName: string | null;
}

export interface BranchAuditEntry {
  id: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  createdAt: string;
  employeeName: string | null;
  oldValue: string | null;
  newValue: string | null;
}

export interface BranchHistoryPage {
  entries: BranchAuditEntry[];
  nextCursor: number | null;
  hasMore: boolean;
}

export interface BranchHourRow {
  dayOfWeek: number;
  openingTime: string | null;
  closingTime: string | null;
  isClosed: boolean;
}

export interface BranchMetrics {
  total: number;
  withEmployees: number;
  withoutEmployees: number;
}

export type BranchFormField =
  | "name"
  | "nit"
  | "phone"
  | "address"
  | "city"
  | "department"
  | "country"
  | "googleMaps"
  | "managerId"
  | "confirmPassword"
  | "openedAt";

export interface BranchActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<BranchFormField, string>>;
  branch?: BranchRow;
}
