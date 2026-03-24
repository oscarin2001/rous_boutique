export type ManagerStatus = "ACTIVE" | "DEACTIVATED" | "INACTIVE";

export interface ManagerBranchSummary {
  id: number;
  name: string;
  city: string;
}

export interface ManagerRow {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  ci: string;
  phone: string | null;
  email: string;
  salary: number;
  receivesSalary: boolean;
  homeAddress: string | null;
  birthDate: string | null;
  hireDate: string;
  status: ManagerStatus;
  branches: ManagerBranchSummary[];
  createdAt: string;
  updatedAt: string | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface ManagerDetails extends ManagerRow {
  roleCode: string;
  authActive: boolean;
}

export interface ManagerMetrics {
  total: number;
  active: number;
  deactivated: number;
  inactive: number;
  withBranches: number;
  withoutBranches: number;
}

export interface ManagerBranchOption {
  id: number;
  name: string;
  city: string;
  assignedManagerCount: number;
}

export type ManagerFormField =
  | "firstName"
  | "lastName"
  | "ci"
  | "phone"
  | "email"
  | "password"
  | "passwordConfirm"
  | "receivesSalary"
  | "salary"
  | "homeAddress"
  | "birthDate"
  | "hireDate"
  | "branchIds"
  | "adminConfirmPassword"
  | "statusReason";

export interface ManagerActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<ManagerFormField, string>>;
  manager?: ManagerRow;
}

export interface ManagerAuditEntry {
  id: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  createdAt: string;
  employeeName: string | null;
  oldValue: string | null;
  newValue: string | null;
}

export interface ManagerHistoryPage {
  entries: ManagerAuditEntry[];
  nextCursor: number | null;
  hasMore: boolean;
}
