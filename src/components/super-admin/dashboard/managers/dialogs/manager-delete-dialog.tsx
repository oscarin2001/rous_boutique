"use client";

import { useState } from "react";

import { AlertTriangle, Trash2 } from "lucide-react";

import type { ManagerRow } from "@/actions/super-admin/managers/types";

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

import { getManagerStatusInfo } from "../utils/manager-status";

interface Props {
  manager: ManagerRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (confirmPassword: string) => void;
  isPending: boolean;
}

 
export function ManagerDeleteDialog({ manager, open, onOpenChange, onConfirm, isPending }: Props) {
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);

  if (!manager) return null;

  const expectedName = manager.fullName.toLowerCase();
  const nameMatches = confirmation.trim().toLowerCase() === expectedName;

  const handleClose = (value: boolean) => {
    if (!value) {
      setConfirmation("");
      setPassword("");
      setStep(1);
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sa-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="size-5" />
            <AlertTriangle className="size-4" />
            Eliminar Encargado de sucursal
          </DialogTitle>
          <DialogDescription>
            Esta accion es irreversible. Se eliminara al encargado
            <strong className="mx-1">{manager.fullName}</strong>
            y se desactivara su acceso.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-destructive" : "bg-muted"}`} />
          ))}
        </div>

        <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">Información del encargado</p>
          <p>Nombre: {manager.fullName}</p>
          <p>CI: {manager.ci}</p>
          <p>Estado: {getManagerStatusInfo(manager.status).label}</p>
          <p>Sucursales asignadas: {manager.branches.length}</p>
        </div>

        {step === 1 ? (
          <div className="rounded-md border bg-muted/50 p-3 text-sm">
            Si el encargado <strong>aporta</strong> al negocio, sus registros de actividad se mantendrán, pero si <strong>no atribuye</strong> ningún valor histórico o fue un registro erróneo, se eliminarán sus asignaciones a sucursales y accesos. Esta acción es definitiva.
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="manager-confirm-name">
                Escribe <strong>{manager.fullName}</strong> para confirmar
              </Label>
              <Input
                id="manager-confirm-name"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
               
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager-confirm-password">Contrasena de administrador</Label>
              <PasswordInput
                id="manager-confirm-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Confirmacion final: al continuar, el encargado sera eliminado permanentemente.
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>

          {step > 1 ? (
            <Button type="button" variant="outline" onClick={() => setStep((value) => value - 1)}>
              Atras
            </Button>
          ) : null}

          {step < 3 ? (
            <Button
              variant="destructive"
              onClick={() => setStep((value) => value + 1)}
              disabled={step === 2 && (!nameMatches || !password.trim())}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => onConfirm(password)}
              disabled={isPending || !nameMatches || !password.trim()}
            >
              {isPending ? "Eliminando..." : "Confirmar Eliminacion"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

