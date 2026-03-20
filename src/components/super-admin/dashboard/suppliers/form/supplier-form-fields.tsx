"use client";

import { SupplierAssignmentFields } from "./supplier-assignment-fields";
import { SupplierBasicFields } from "./supplier-basic-fields";
import type { SupplierFormProps } from "./supplier-form-types";

export function SupplierFormFields({
  supplier,
  branchOptions,
  managerOptions,
  selectedBranchIds,
  onSelectedBranchIdsChange,
  selectedManagerIds,
  onSelectedManagerIdsChange,
  errors,
  onFieldInput,
}: SupplierFormProps) {
  return (
    <div className="space-y-4">
      <SupplierBasicFields supplier={supplier} errors={errors} onFieldInput={onFieldInput} />
      <SupplierAssignmentFields
        branchOptions={branchOptions}
        managerOptions={managerOptions}
        selectedBranchIds={selectedBranchIds}
        onSelectedBranchIdsChange={onSelectedBranchIdsChange}
        selectedManagerIds={selectedManagerIds}
        onSelectedManagerIdsChange={onSelectedManagerIdsChange}
        errors={errors}
        onFieldInput={onFieldInput}
      />
    </div>
  );
}
