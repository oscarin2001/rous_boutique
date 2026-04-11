"use client";

import { useEffect, useState } from "react";

import type { SuperAdminRow } from "@/actions/super-admin/superadmins/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  superAdmin: SuperAdminRow | null;
  isPending: boolean;
  error?: string | null;
  onConfirm: (payload: { adminConfirmPassword: string; statusReason: string }) => void;
};

export function SuperAdminStatusDialog({
  open,
  onOpenChange,
  superAdmin,
  isPending,
  error,
  onConfirm,
}: Props) {
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [statusReason, setStatusReason] = useState("");

  useEffect(() => {
    if (!open) {
      setAdminConfirmPassword("");
      setStatusReason("");
    }
  }, [open]);

  if (!superAdmin) return null;

  const actionLabel = superAdmin.status === "ACTIVE" ? "Desactivar" : "Activar";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal">
        <DialogHeader>
          <DialogTitle>{actionLabel} super admin</DialogTitle>
          <DialogDescription>
            Vas a cambiar el estado de <strong>{superAdmin.fullName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Motivo (opcional)</Label>
            <Textarea
              rows={3}
              value={statusReason}
              onChange={(event) => setStatusReason(event.target.value.slice(0, 160))}
              placeholder="Describe el motivo del cambio de estado"
            />
          </div>
          <div className="space-y-2">
            <Label>Contrasena de confirmacion</Label>
            <PasswordInput
              value={adminConfirmPassword}
              onChange={(event) => setAdminConfirmPassword(event.target.value)}
              placeholder="Ingresa tu contrasena actual"
            />
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isPending || !adminConfirmPassword.trim()}
            className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            onClick={() => onConfirm({ adminConfirmPassword, statusReason })}
          >
            {isPending ? "Procesando..." : `Confirmar ${actionLabel.toLowerCase()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
