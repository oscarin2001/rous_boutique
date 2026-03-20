import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { ADMIN_VALIDATION_MESSAGES } from "@/lib/admin-validation-messages";

import type { SupplierFormProps } from "./supplier-form-types";

type Props = Pick<
  SupplierFormProps,
  | "branchOptions"
  | "managerOptions"
  | "selectedBranchIds"
  | "onSelectedBranchIdsChange"
  | "selectedManagerIds"
  | "onSelectedManagerIdsChange"
  | "errors"
  | "onFieldInput"
>;

export function SupplierAssignmentFields({
  branchOptions,
  managerOptions,
  selectedBranchIds,
  onSelectedBranchIdsChange,
  selectedManagerIds,
  onSelectedManagerIdsChange,
  errors,
  onFieldInput,
}: Props) {
  const branchSet = new Set(selectedBranchIds);
  const managerSet = new Set(selectedManagerIds);

  const toggleBranch = (id: number) => {
    const next = branchSet.has(id)
      ? selectedBranchIds.filter((item) => item !== id)
      : [...selectedBranchIds, id];
    onSelectedBranchIdsChange(next);
    onFieldInput?.("branchIds");
  };

  const toggleManager = (id: number) => {
    const next = managerSet.has(id)
      ? selectedManagerIds.filter((item) => item !== id)
      : [...selectedManagerIds, id];
    onSelectedManagerIdsChange(next);
    onFieldInput?.("managerIds");
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2 rounded-lg border p-3">
        <Label className="text-sm font-medium">Sucursales de Operacion</Label>
        <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
          {branchOptions.length === 0 ? <p className="text-xs text-muted-foreground">No hay sucursales.</p> : null}
          {branchOptions.map((branch) => (
            <label key={branch.id} className="flex items-center gap-2 rounded px-1 py-1 hover:bg-muted/40">
              <Checkbox checked={branchSet.has(branch.id)} onCheckedChange={() => toggleBranch(branch.id)} />
              <span className="text-xs">{branch.name} ({branch.city})</span>
            </label>
          ))}
        </div>
        {selectedBranchIds.map((id) => <input key={id} type="hidden" name="branchIds" value={id} />)}
        <p className="text-[11px] text-muted-foreground">{ADMIN_VALIDATION_MESSAGES.branchRequired}</p>
        {errors?.branchIds ? <p className="text-xs text-destructive">{errors.branchIds}</p> : null}
      </div>

      <div className="space-y-2 rounded-lg border p-3">
        <Label className="text-sm font-medium">Encargados de Relacion</Label>
        <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
          {managerOptions.length === 0 ? <p className="text-xs text-muted-foreground">No hay empleados.</p> : null}
          {managerOptions.map((manager) => (
            <label key={manager.id} className="flex items-center gap-2 rounded px-1 py-1 hover:bg-muted/40">
              <Checkbox checked={managerSet.has(manager.id)} onCheckedChange={() => toggleManager(manager.id)} />
              <span className="text-xs">{manager.fullName}</span>
            </label>
          ))}
        </div>
        {selectedManagerIds.map((id) => <input key={id} type="hidden" name="managerIds" value={id} />)}
        {errors?.managerIds ? <p className="text-xs text-destructive">{errors.managerIds}</p> : null}
      </div>
    </div>
  );
}
