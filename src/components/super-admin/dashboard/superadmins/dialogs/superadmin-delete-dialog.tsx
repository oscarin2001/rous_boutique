"use client";

import { useEffect, useMemo, useState } from "react";

import type { SuperAdminRow } from "@/actions/super-admin/superadmins/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  superAdmin: SuperAdminRow | null;
  isPending: boolean;
  error?: string | null;
  onConfirm: (payload: { adminConfirmPassword: string }) => void;
};

export function SuperAdminDeleteDialog({
  open,
  onOpenChange,
  superAdmin,
  isPending,
  error,
  onConfirm,
}: Props) {
  const [confirmName, setConfirmName] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");

  useEffect(() => {
    if (!open) {
      setConfirmName("");
      setAdminConfirmPassword("");
    }
  }, [open]);

  const expected = useMemo(() => superAdmin?.fullName.trim().toLowerCase() ?? "", [superAdmin]);
  const matches = confirmName.trim().toLowerCase() === expected;

  if (!superAdmin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal">
        <DialogHeader>
          <DialogTitle className="text-destructive">Eliminar super admin</DialogTitle>
          <DialogDescription>
            Esta accion desactiva la cuenta y revoca las sesiones de <strong>{superAdmin.fullName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Escribe el nombre completo para confirmar</Label>
            <Input
              value={confirmName}
              onChange={(event) => setConfirmName(event.target.value)}
              placeholder={superAdmin.fullName}
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
            variant="destructive"
            disabled={isPending || !matches || !adminConfirmPassword.trim()}
            onClick={() => onConfirm({ adminConfirmPassword })}
          >
            {isPending ? "Eliminando..." : "Confirmar eliminacion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
