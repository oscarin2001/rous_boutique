import { z } from "zod";

export const supplierFormFieldSchema = z.enum([
  "firstName",
  "lastName",
  "phone",
  "email",
  "address",
  "city",
  "department",
  "country",
  "ci",
  "notes",
  "birthDate",
  "partnerSince",
  "contractEndAt",
  "isIndefinite",
  "isActive",
  "branchIds",
  "managerIds"
  ,"confirmPassword"
]);

export type SupplierFormField = z.infer<typeof supplierFormFieldSchema>;

export interface SupplierBranch {
  id: number;
  name: string;
  city: string;
}

export interface SupplierManager {
  id: number;
  fullName: string;
}

export interface SupplierRow {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  department: string | null;
  country: string | null;
  ci: string | null;
  notes: string | null;
  birthDate: string | null;
  partnerSince: string | null;
  contractEndAt: string | null;
  isIndefinite: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdByName: string | null;
  updatedByName: string | null;
  
  // Relations
  branches: SupplierBranch[];
  managers: SupplierManager[];
  
  // Basic Stats
  purchaseCount: number;
  totalPurchaseAmount: number;
}

export interface SupplierHistoryRow {
  id: number;
  action: "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE";
  entity: string;
  oldValue: string | null;
  newValue: string | null;
  employeeName: string | null;
  createdAt: string;
}

export interface SupplierMetrics {
  totalSuppliers: number;
  activeSuppliers: number;
  newThisMonth: number;
  totalPurchases: number;
}

export interface SupplierBranchOption {
  id: number;
  name: string;
  city: string;
}

export interface SupplierManagerOption {
  id: number;
  fullName: string;
}

export type SupplierActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<SupplierFormField, string>>;
};
