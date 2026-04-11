"use client";

import { useEffect, useMemo, useState } from "react";

import { Link2 } from "lucide-react";

import type { ManagerActionResult, ManagerBranchOption, ManagerRow } from "@/actions/super-admin/managers/types";

import { InlineActionError } from "@/components/super-admin/dashboard/shared/forms/inline-feedback";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

import { ADMIN_VALIDATION_MESSAGES } from "@/lib/admin-validation-messages";

const MAX_MANAGERS_PER_BRANCH = 2;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manager: ManagerRow | null;
  branchOptions: ManagerBranchOption[];
  isPending: boolean;
  onSave: (data: Record<string, unknown>, id: number) => Promise<ManagerActionResult>;
}

export function ManagerAssignmentsDialog({ open, onOpenChange, manager, branchOptions, isPending, onSave }: Props) {
  const [branchIds, setBranchIds] = useState<number[]>([]);
  const [confirmName, setConfirmName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !manager) return;
    setBranchIds(manager.branches.map((item) => item.id));
    setConfirmName("");
    setConfirmPassword("");
    setMessage(null);
  }, [open, manager]);

  const selectedSet = useMemo(() => new Set(branchIds), [branchIds]);
  const currentSet = useMemo(() => new Set(manager?.branches.map((item) => item.id) ?? []), [manager]);

  const toggleBranch = (id: number) => {
    setBranchIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    setMessage(null);
  };

  const handleSave = async () => {
    if (!manager) return;
    if (!branchOptions.length) return setMessage("No hay sucursales disponibles para asignar.");
    if (!branchIds.length) return setMessage(ADMIN_VALIDATION_MESSAGES.branchRequired);
    if (confirmName.trim().toLowerCase() !== manager.fullName.toLowerCase()) return setMessage("Debes escribir exactamente el nombre del encargado.");
    if (!confirmPassword.trim()) return setMessage(ADMIN_VALIDATION_MESSAGES.adminPasswordRequired);

    const result = await onSave({ branchIds, adminConfirmPassword: confirmPassword }, manager.id);
    if (!result.success) setMessage(result.error ?? "No se pudieron guardar asignaciones");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Link2 className="size-5 text-primary" /> Gestionar asignaciones</DialogTitle>
          <DialogDescription>Configura sucursales del encargado sin editar sus datos base.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-lg border p-3">
          <Label className="text-sm">Sucursales</Label>
          <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
            {branchOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay sucursales disponibles para asignar.</p>
            ) : (
              branchOptions.map((branch) => {
              const isChecked = selectedSet.has(branch.id);
              const isDisabled = !currentSet.has(branch.id) && branch.assignedManagerCount >= MAX_MANAGERS_PER_BRANCH;
              const id = `manager-assign-${branch.id}`;
              return (
                <label key={branch.id} htmlFor={id} className="flex items-center gap-2 rounded px-1 py-1.5 hover:bg-muted/40">
                  <Checkbox id={id} checked={isChecked} disabled={isDisabled} onCheckedChange={() => toggleBranch(branch.id)} />
                  <span className="text-sm">{branch.name} ({branch.city})</span>
                </label>
              );
              })
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Escribe {manager?.fullName} para confirmar</Label>
          <Input value={confirmName} onChange={(e) => setConfirmName(e.target.value)} />
          <Label>Contrasena de administrador</Label>
          <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>

        <InlineActionError message={message} />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isPending}>{isPending ? "Guardando..." : "Guardar asignaciones"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
