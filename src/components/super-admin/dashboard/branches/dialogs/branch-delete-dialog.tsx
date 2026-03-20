"use client";

import { useState } from "react";

import { AlertTriangle, Trash2 } from "lucide-react";

import type { BranchRow } from "@/actions/super-admin/branches/types";

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
  onConfirm: (confirmPassword: string) => void;
  isPending: boolean;
}

function fmtDateTime(value: string | null): string {
  if (!value) return "No disponible";
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function BranchDeleteDialog({
  branch,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: Props) {
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);

  if (!branch) return null;
  const nameMatches =
    confirmation.toLowerCase() === branch.name.toLowerCase();

  const handleClose = (v: boolean) => {
    if (!v) {
      setConfirmation("");
      setPassword("");
      setStep(1);
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sa-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="size-5" />
            <AlertTriangle className="size-4" />
            Eliminar Sucursal
          </DialogTitle>
          <DialogDescription>
            Esta acción es irreversible. Se eliminará la sucursal
            <strong className="mx-1">{branch.name}</strong>
            y todos sus datos asociados.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-destructive" : "bg-muted"}`}
            />
          ))}
        </div>

        <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">Trazabilidad</p>
          <p>Creado por: {branch.createdByName ?? "No disponible"}</p>
          <p>Creado el: {fmtDateTime(branch.createdAt)}</p>
          <p>Actualizado por: {branch.updatedByName ?? "No disponible"}</p>
          <p>Actualizado el: {fmtDateTime(branch.updatedAt)}</p>
        </div>

        {branch.employeeCount > 0 && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            No se puede eliminar esta sucursal porque tiene{" "}
            <strong>{branch.employeeCount}</strong> empleado(s) asignado(s).
            Reasígnalos antes de continuar.
          </div>
        )}

        {branch.employeeCount === 0 && step === 1 && (
          <div className="rounded-md border bg-muted/50 p-3 text-sm">
            Se eliminarán datos de la sucursal y su configuración operativa.
            Esta acción no se puede deshacer.
          </div>
        )}

        {branch.employeeCount === 0 && step === 2 && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="confirm-name">
                Escribe <strong>{branch.name}</strong> para confirmar
              </Label>
              <Input
                id="confirm-name"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
               
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Contraseña de administrador</Label>
              <PasswordInput
                id="confirm-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        {branch.employeeCount === 0 && step === 3 && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Confirmación final: al continuar, la sucursal será eliminada permanentemente.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>

          {step > 1 && branch.employeeCount === 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Atrás
            </Button>
          )}

          {step < 3 ? (
            <Button
              variant="destructive"
              onClick={() => setStep((s) => s + 1)}
              disabled={branch.employeeCount > 0 || (step === 2 && !nameMatches)}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => onConfirm(password)}
              disabled={isPending || branch.employeeCount > 0 || !nameMatches || !password.trim()}
            >
              {isPending ? "Eliminando..." : "Confirmar Eliminación"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

