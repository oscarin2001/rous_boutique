"use client";

import { useState } from "react";

import { AlertTriangle, Trash2 } from "lucide-react";

import type { SupplierRow } from "@/actions/super-admin/suppliers/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

interface Props {
  supplier: SupplierRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
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

export function SupplierDeleteDialog({ supplier, open, onOpenChange, onConfirm, isPending }: Props) {
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  if (!supplier) return null;

  const expectedName = supplier.fullName.toLowerCase();
  const nameMatches = confirmation.trim().toLowerCase() === expectedName;

  const handleClose = (v: boolean) => {
    if (!v) {
      setConfirmation("");
      setPassword("");
      setStep(1);
      setError(null);
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
            Eliminar Proveedor
          </DialogTitle>
          <DialogDescription>
            Acción irreversible. Se eliminará al proveedor <strong>{supplier.fullName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-destructive" : "bg-muted"}`} />
          ))}
        </div>

        <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">Trazabilidad</p>
          <p>Creado por: {supplier.createdByName ?? "No disponible"}</p>
          <p>Creado el: {fmtDateTime(supplier.createdAt)}</p>
          <p>Actualizado por: {supplier.updatedByName ?? "No disponible"}</p>
          <p>Actualizado el: {fmtDateTime(supplier.updatedAt)}</p>
        </div>

        {step === 1 ? (
          <div className="rounded-md border bg-muted/50 p-3 text-sm">
            Si el proveedor <strong>aporta</strong> al negocio, sus compras históricas se mantendrán, pero si <strong>no atribuye</strong> ningún valor histórico o fue un error, sus asignaciones se eliminarán.
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Escribe {supplier.fullName} para confirmar</Label>
              <Input value={confirmation} onChange={e => setConfirmation(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Contraseña de administrador</Label>
              <PasswordInput value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive font-medium text-center">
            Confirmación final: El proveedor será eliminado permanentemente.
          </div>
        ) : null}

        {error && <p className="text-xs text-destructive text-center">{error}</p>}

        <DialogFooter>
           <Button variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
           {step > 1 && <Button variant="outline" onClick={() => setStep(s => s - 1)}>Atras</Button>}
           
           {step < 3 ? (
             <Button variant="destructive" onClick={() => setStep(s => s + 1)} disabled={step === 2 && (!nameMatches || !password)}>Siguiente</Button>
           ) : (
               <Button variant="destructive" onClick={() => onConfirm(password)} disabled={isPending || !nameMatches || !password.trim()}>{isPending ? "Eliminando..." : "Eliminar Proveedor"}</Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

