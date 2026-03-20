"use client";

import { useEffect, useMemo, useState } from "react";

import { Link2 } from "lucide-react";

import type { SupplierActionResult, SupplierBranchOption, SupplierManagerOption, SupplierRow } from "@/actions/super-admin/suppliers/types";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

import { ADMIN_VALIDATION_MESSAGES } from "@/lib/admin-validation-messages";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: SupplierRow | null;
  branchOptions: SupplierBranchOption[];
  managerOptions: SupplierManagerOption[];
  isPending: boolean;
  onSave: (data: Record<string, unknown>, id: number) => Promise<SupplierActionResult>;
}

export function SupplierAssignmentsDialog({ open, onOpenChange, supplier, branchOptions, managerOptions, isPending, onSave }: Props) {
  const [branchIds, setBranchIds] = useState<number[]>([]);
  const [managerIds, setManagerIds] = useState<number[]>([]);
  const [confirmName, setConfirmName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !supplier) return;
    setBranchIds(supplier.branches.map((item) => item.id));
    setManagerIds(supplier.managers.map((item) => item.id));
    setConfirmName("");
    setConfirmPassword("");
    setMessage(null);
  }, [open, supplier]);

  const branchSet = useMemo(() => new Set(branchIds), [branchIds]);
  const managerSet = useMemo(() => new Set(managerIds), [managerIds]);

  const toggle = (id: number, set: Set<number>, update: (next: number[]) => void, source: number[]) => {
    update(set.has(id) ? source.filter((item) => item !== id) : [...source, id]);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!supplier) return;
    if (!branchIds.length) return setMessage(ADMIN_VALIDATION_MESSAGES.branchRequired);
    if (confirmName.trim().toLowerCase() !== supplier.fullName.toLowerCase()) return setMessage("Debes escribir exactamente el nombre del proveedor.");
    if (!confirmPassword.trim()) return setMessage(ADMIN_VALIDATION_MESSAGES.adminPasswordRequired);

    const result = await onSave({ branchIds, managerIds, confirmPassword }, supplier.id);
    if (!result.success) setMessage(result.error ?? "No se pudieron guardar asignaciones");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Link2 className="size-5 text-primary" /> Gestionar asignaciones</DialogTitle>
          <DialogDescription>Configura sucursales y encargados del proveedor sin tocar datos base.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 rounded-lg border p-3">
            <Label className="text-sm">Sucursales</Label>
            <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
              {branchOptions.map((branch) => (
                <label key={branch.id} className="flex items-center gap-2 rounded px-1 py-1.5 hover:bg-muted/40">
                  <Checkbox checked={branchSet.has(branch.id)} onCheckedChange={() => toggle(branch.id, branchSet, setBranchIds, branchIds)} />
                  <span className="text-sm">{branch.name} ({branch.city})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-lg border p-3">
            <Label className="text-sm">Encargados</Label>
            <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
              {managerOptions.map((manager) => (
                <label key={manager.id} className="flex items-center gap-2 rounded px-1 py-1.5 hover:bg-muted/40">
                  <Checkbox checked={managerSet.has(manager.id)} onCheckedChange={() => toggle(manager.id, managerSet, setManagerIds, managerIds)} />
                  <span className="text-sm">{manager.fullName}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Escribe {supplier?.fullName} para confirmar</Label>
          <Input value={confirmName} onChange={(e) => setConfirmName(e.target.value)} />
          <Label>Contrasena de administrador</Label>
          <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>

        {message ? <p className="text-sm text-destructive">{message}</p> : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isPending}>{isPending ? "Guardando..." : "Guardar asignaciones"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
