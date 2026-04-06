"use client";

import { SupplierBasicFields } from "./supplier-basic-fields";
import type { SupplierFormProps } from "./supplier-form-types";

export function SupplierFormFields({ supplier, errors, onFieldInput }: SupplierFormProps) {
  return (
    <div className="space-y-4">
      <SupplierBasicFields supplier={supplier} errors={errors} onFieldInput={onFieldInput} />
    </div>
  );
}
