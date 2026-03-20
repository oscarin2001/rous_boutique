"use client";

import { useState } from "react";

import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

type Props = {
  open: boolean;
  title: string;
  description: string;
  isPending: boolean;
  error?: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => void;
};

export function ConfirmPasswordDialog({ open, title, description, isPending, error, onOpenChange, onConfirm }: Props) {
  const [password, setPassword] = useState("");

  const handleClose = (next: boolean) => {
    if (!next) setPassword("");
    onOpenChange(next);
  };

  const handleConfirm = () => {
    onConfirm(password);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sa-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ShieldAlert className="size-4" />{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="confirm-current-password">Contrasena actual del superadmin</Label>
          <PasswordInput id="confirm-current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error ? <p className="text-xs text-destructive">{error}</p> : <p className="text-xs text-muted-foreground">Validamos identidad antes de aplicar cambios sensibles.</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={isPending || !password.trim()}>{isPending ? "Validando..." : "Confirmar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
