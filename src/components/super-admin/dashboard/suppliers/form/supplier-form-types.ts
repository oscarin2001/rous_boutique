import type {
  SupplierFormField,
  SupplierBranchOption,
  SupplierManagerOption,
  SupplierRow,
} from "@/actions/super-admin/suppliers/types";

export type FieldErrors = Partial<Record<SupplierFormField, string>>;

export type SupplierDraft = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  department: string;
  country: string;
  ci: string;
  notes: string;
  birthDate: string;
  partnerSince: string;
  contractEndAt: string;
  isIndefinite: boolean;
  branchIds: number[];
  managerIds: number[];
};

export type ChangeItem = { label: string; from: string; to: string };

export interface SupplierFormProps {
  supplier: SupplierRow | null;
  branchOptions: SupplierBranchOption[];
  managerOptions: SupplierManagerOption[];
  selectedBranchIds: number[];
  onSelectedBranchIdsChange: (ids: number[]) => void;
  selectedManagerIds: number[];
  onSelectedManagerIdsChange: (ids: number[]) => void;
  errors?: FieldErrors;
  onFieldInput?: (name: SupplierFormField) => void;
}

