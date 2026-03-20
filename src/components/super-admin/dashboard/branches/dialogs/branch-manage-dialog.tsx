"use client";

import { useEffect, useMemo, useState } from "react";

import { SlidersHorizontal } from "lucide-react";

import type {
  BranchActionResult,
  BranchManagerOption,
  BranchRow,
  BranchSupplierOption,
  BranchWarehouseOption,
} from "@/actions/super-admin/branches/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

interface Props {
  branch: BranchRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  managerOptions: BranchManagerOption[];
  warehouseOptions: BranchWarehouseOption[];
  supplierOptions: BranchSupplierOption[];
  isPending: boolean;
  onSave: (payload: { managerIds: number[]; warehouseIds: number[]; supplierIds: number[]; confirmPassword: string }) => Promise<BranchActionResult>;
}

export function BranchManageDialog({
  branch,
  open,
  onOpenChange,
  managerOptions,
  warehouseOptions,
  supplierOptions,
  isPending,
  onSave,
}: Props) {
  const [managerIds, setManagerIds] = useState<number[]>([]);
  const [warehouseIds, setWarehouseIds] = useState<number[]>([]);
  const [supplierIds, setSupplierIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmName, setConfirmName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changes, setChanges] = useState<string[]>([]);

  useEffect(() => {
    if (!branch) return;
    setManagerIds(branch.managers.map((manager) => manager.id));
    setWarehouseIds(branch.warehouses.map((warehouse) => warehouse.id));
    setSupplierIds(branch.suppliers.map((supplier) => supplier.id));
    setError(null);
    setStep(1);
    setConfirmName("");
    setConfirmPassword("");
    setChanges([]);
  }, [branch]);

  const managerSet = useMemo(() => new Set(managerIds), [managerIds]);
  const warehouseSet = useMemo(() => new Set(warehouseIds), [warehouseIds]);
  const supplierSet = useMemo(() => new Set(supplierIds), [supplierIds]);

  if (!branch) return null;

  const toggle = (current: number[], id: number) =>
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id];

  const summarize = () => {
    if (!branch) return [] as string[];

    const currentManagers = new Set(branch.managers.map((item) => item.id));
    const nextManagers = new Set(managerIds);
    const currentWarehouses = new Set(branch.warehouses.map((item) => item.id));
    const nextWarehouses = new Set(warehouseIds);
    const currentSuppliers = new Set(branch.suppliers.map((item) => item.id));
    const nextSuppliers = new Set(supplierIds);

    const changesSummary: string[] = [];

    for (const manager of managerOptions) {
      const had = currentManagers.has(manager.id);
      const has = nextManagers.has(manager.id);
      if (had && !has) changesSummary.push(`Gerente removido: ${manager.name}`);
      if (!had && has) changesSummary.push(`Gerente agregado: ${manager.name}`);
    }

    for (const warehouse of warehouseOptions) {
      const had = currentWarehouses.has(warehouse.id);
      const has = nextWarehouses.has(warehouse.id);
      if (had && !has) changesSummary.push(`Almacén removido: ${warehouse.name}`);
      if (!had && has) changesSummary.push(`Almacén agregado: ${warehouse.name}`);
    }

    for (const supplier of supplierOptions) {
      const had = currentSuppliers.has(supplier.id);
      const has = nextSuppliers.has(supplier.id);
      if (had && !has) changesSummary.push(`Proveedor removido: ${supplier.name}`);
      if (!had && has) changesSummary.push(`Proveedor agregado: ${supplier.name}`);
    }

    return changesSummary;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 1) {
      const nextChanges = summarize();
      if (nextChanges.length === 0) {
        setError("No detectamos cambios para guardar.");
        return;
      }
      setChanges(nextChanges);
      setError(null);
      setStep(2);
      return;
    }

    if (confirmName.trim().toLowerCase() !== branch.name.trim().toLowerCase()) {
      setError("Debes escribir exactamente el nombre de la sucursal.");
      return;
    }
    if (!confirmPassword.trim()) {
      setError("Ingresa la contraseña de confirmación.");
      return;
    }

    const result = await onSave({ managerIds, warehouseIds, supplierIds, confirmPassword });
    if (!result.success) {
      setError(result.error ?? "No se pudo guardar la configuración");
      return;
    }
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SlidersHorizontal className="size-5 text-primary" />
            Gestionar Sucursal
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? `Asigna gerentes, almacenes y proveedores para ${branch.name}.`
              : "Revisa cambios y confirma con contraseña."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            <section className="rounded-lg border p-3">
              <h4 className="mb-2 text-sm font-medium">Gerentes</h4>
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {managerOptions.map((manager) => (
                  <label key={manager.id} className="flex cursor-pointer items-start gap-2 rounded px-1 py-1 text-sm hover:bg-muted/40">
                    <input
                      type="checkbox"
                      checked={managerSet.has(manager.id)}
                      onChange={() => setManagerIds((prev) => toggle(prev, manager.id))}
                    />
                    <span>
                      {manager.name}
                      {manager.assignedBranchId && manager.assignedBranchId !== branch.id
                        ? ` (tambien en ${manager.assignedBranchName})`
                        : ""}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-lg border p-3">
              <h4 className="mb-2 text-sm font-medium">Almacenes</h4>
              <p className="mb-2 text-xs text-muted-foreground">
                El primer almacén seleccionado quedará como principal.
              </p>
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {warehouseOptions.map((warehouse) => (
                  <label key={warehouse.id} className="flex cursor-pointer items-start gap-2 rounded px-1 py-1 text-sm hover:bg-muted/40">
                    <input
                      type="checkbox"
                      checked={warehouseSet.has(warehouse.id)}
                      onChange={() => setWarehouseIds((prev) => toggle(prev, warehouse.id))}
                    />
                    <span>
                      {warehouse.name}
                      {warehouse.city ? ` - ${warehouse.city}` : ""}
                      {warehouse.assignedBranchId && warehouse.assignedBranchId !== branch.id
                        ? ` (tambien en ${warehouse.assignedBranchName})`
                        : ""}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-lg border p-3">
              <h4 className="mb-2 text-sm font-medium">Proveedores</h4>
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {supplierOptions.map((supplier) => (
                  <label key={supplier.id} className="flex cursor-pointer items-start gap-2 rounded px-1 py-1 text-sm hover:bg-muted/40">
                    <input
                      type="checkbox"
                      checked={supplierSet.has(supplier.id)}
                      onChange={() => setSupplierIds((prev) => toggle(prev, supplier.id))}
                    />
                    <span>
                      {supplier.name}
                      {supplier.assignedBranchId && supplier.assignedBranchId !== branch.id
                        ? ` (tambien en ${supplier.assignedBranchName})`
                        : ""}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </div> : (
            <div className="space-y-4">
              <div className="space-y-2 rounded-lg border p-3">
                <h4 className="text-sm font-medium">Cambios detectados</h4>
                <div className="max-h-52 space-y-1 overflow-y-auto text-sm">
                  {changes.map((item) => (
                    <p key={item} className="rounded border p-2">{item}</p>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manage-confirm-name">Nombre de la sucursal</Label>
                <Input
                  id="manage-confirm-name"
                  value={confirmName}
                  onChange={(event) => setConfirmName(event.target.value)}
                 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manage-confirm-password">Contraseña de administrador</Label>
                <PasswordInput
                  id="manage-confirm-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
            </div>
          )}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            {step === 2 ? (
              <Button type="button" variant="outline" onClick={() => { setStep(1); setError(null); }}>
                Atrás
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Guardando..."
                : step === 1
                  ? "Revisar Cambios"
                  : "Confirmar Gestión"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

