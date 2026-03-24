"use client";

import { useEffect, useState } from "react";

import { Power } from "lucide-react";

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

import { ADMIN_VALIDATION_MESSAGES } from "@/lib/admin-validation-messages";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manager: ManagerRow | null;
  isPending: boolean;
  onConfirm: (
    confirmPassword: string,
    confirmName: string,
    reason: string
  ) => Promise<string | null>;
};

export function ManagerStatusDialog({
  open,
  onOpenChange,
  manager,
  isPending,
  onConfirm,
}: Props) {
  const [confirmName, setConfirmName] = useState("");
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setConfirmName("");
      setReason("");
      setPassword("");
      setMessage(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!manager) {
      setMessage("Encargado no encontrado.");
      return;
    }

    if (confirmName.trim().toLowerCase() !== manager.fullName.trim().toLowerCase()) {
      setMessage("Debes escribir exactamente el nombre del encargado.");
      return;
    }

    if (reason.trim().length < 10) {
      setMessage("Describe el motivo con al menos 10 caracteres.");
      return;
    }

    if (reason.trim().length > 160) {
      setMessage("El motivo no puede exceder 160 caracteres.");
      return;
    }

    if (!password.trim()) {
      setMessage(ADMIN_VALIDATION_MESSAGES.adminPasswordRequired);
      return;
    }

    const error = await onConfirm(password, confirmName, reason.trim());
    if (error) {
      setMessage(error);
      return;
    }

    onOpenChange(false);
  };

  const actionText = manager?.status === "ACTIVE" ? "desactivar" : "activar";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Power className="size-5 text-primary" />
            Confirmar cambio de estado
          </DialogTitle>
          <DialogDescription>
            Vas a {actionText} el acceso del encargado <strong>{manager?.fullName ?? ""}</strong>.
            Ingresa tu contraseña de administrador para continuar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="manager-toggle-status-name">Escribe {manager?.fullName ?? ""} para confirmar</Label>
          <Input
            id="manager-toggle-status-name"
            value={confirmName}
            onChange={(event) => {
              setConfirmName(event.target.value);
              setMessage(null);
            }}
          />
          <Label htmlFor="manager-toggle-status-reason">Motivo del cambio</Label>
          <Input
            id="manager-toggle-status-reason"
            value={reason}
            maxLength={160}
            onChange={(event) => {
              setReason(event.target.value);
              setMessage(null);
            }}
            placeholder="Ej.: Incumplimiento temporal de politica interna"
          />
          <Label htmlFor="manager-toggle-status-password">Contrasena de administrador</Label>
          <PasswordInput
            id="manager-toggle-status-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setMessage(null);
            }}
          />
          {message ? <p className="text-sm text-destructive">{message}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Procesando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
