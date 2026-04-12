"use client";

import { useEffect, useState } from "react";

import { InlineActionError } from "@/components/super-admin/dashboard/shared/forms/inline-feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

type PasswordConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  isPending: boolean;
  errorMessage?: string | null;
  confirmLabel?: string;
  policyNotice?: string;
  sectionTitle?: string;
  sectionSummary?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => void;
};

export function PasswordConfirmModal({
  open,
  title,
  description,
  isPending,
  errorMessage,
  confirmLabel = "Confirmar y guardar",
  policyNotice,
  sectionTitle,
  sectionSummary,
  onOpenChange,
  onConfirm,
}: PasswordConfirmModalProps) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!open) setPassword("");
  }, [open]);

  const handleConfirm = () => {
    onConfirm(password.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md overflow-hidden border border-border bg-card p-0 sm:max-w-md">
        <div className="space-y-4 p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
            <DialogDescription className="text-sm">{description}</DialogDescription>
          </DialogHeader>

          {sectionTitle || sectionSummary ? (
            <div className="rounded-lg bg-muted/35 p-3">
              {sectionTitle ? <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{sectionTitle}</p> : null}
              {sectionSummary ? <p className="mt-1 text-sm text-foreground/90">{sectionSummary}</p> : null}
            </div>
          ) : null}

          {policyNotice ? (
            <div className="rounded-lg bg-amber-500/10 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400">{policyNotice}</p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="me-password-confirm">Contrasena actual</Label>
            <PasswordInput
              id="me-password-confirm"
              value={password}
              placeholder="Ingresa tu contrasena actual"
              maxLength={72}
              onChange={(event) => setPassword(event.target.value)}
            />
            <InlineActionError message={errorMessage} className="text-xs" />
          </div>
        </div>

        <DialogFooter className="p-4 pt-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || !password.trim()}
            className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            {isPending ? "Validando..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
