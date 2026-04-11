export type SuperAdminStatus = "ACTIVE" | "DEACTIVATED" | "INACTIVE";

export interface SuperAdminRow {
  id: number;
  authId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  ci: string;
  phone: string | null;
  username: string;
  status: SuperAdminStatus;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string | null;
  createdByName: string | null;
  updatedByName: string | null;
  lastLoginAt: string | null;
}

export type SuperAdminFormField =
  | "firstName"
  | "lastName"
  | "birthDate"
  | "ci"
  | "phone"
  | "username"
  | "password"
  | "passwordConfirm"
  | "newPassword"
  | "newPasswordConfirm"
  | "adminConfirmPassword"
  | "statusReason";

export interface SuperAdminActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<SuperAdminFormField, string>>;
  superAdmin?: SuperAdminRow;
}

export interface SuperAdminAuditEntry {
  id: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  createdAt: string;
  employeeName: string | null;
  oldValue: string | null;
  newValue: string | null;
}
