"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  SuperAdminActionResult,
  SuperAdminFormField,
  SuperAdminRow,
} from "@/actions/super-admin/superadmins/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
  SuperAdminFormSections,
  toInitialDraft,
  type FieldErrors,
  type SuperAdminDraft,
} from "./superadmin-form-sections";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  superAdmin: SuperAdminRow | null;
  isPending: boolean;
  onCreate: (payload: Record<string, unknown>) => Promise<SuperAdminActionResult>;
  onUpdate: (id: number, payload: Record<string, unknown>) => Promise<SuperAdminActionResult>;
};

function toPayload(draft: SuperAdminDraft, isEdit: boolean) {
  if (isEdit) {
    return {
      firstName: draft.firstName,
      lastName: draft.lastName,
      birthDate: draft.birthDate,
      ci: draft.ci,
      phone: draft.phone,
      username: draft.username,
      newPassword: draft.newPassword,
      newPasswordConfirm: draft.newPasswordConfirm,
      adminConfirmPassword: draft.adminConfirmPassword,
    };
  }

  return {
    firstName: draft.firstName,
    lastName: draft.lastName,
    birthDate: draft.birthDate,
    ci: draft.ci,
    phone: draft.phone,
    username: draft.username,
    password: draft.password,
    passwordConfirm: draft.passwordConfirm,
    adminConfirmPassword: draft.adminConfirmPassword,
  };
}

export function SuperAdminFormDialog({
  open,
  onOpenChange,
  superAdmin,
  isPending,
  onCreate,
  onUpdate,
}: Props) {
  const isEdit = Boolean(superAdmin);
  const [draft, setDraft] = useState<SuperAdminDraft>(toInitialDraft(superAdmin));
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!open) return;
    setDraft(toInitialDraft(superAdmin));
    setErrors({});
  }, [open, superAdmin]);

  const title = useMemo(
    () => (isEdit ? `Editar super admin: ${superAdmin?.fullName ?? ""}` : "Nuevo super admin"),
    [isEdit, superAdmin],
  );

  const setField = <K extends keyof SuperAdminDraft>(field: K, value: SuperAdminDraft[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (errors[field as SuperAdminFormField]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const payload = toPayload(draft, isEdit);
    const result = isEdit && superAdmin ? await onUpdate(superAdmin.id, payload) : await onCreate(payload);

    if (!result.success) {
      if (result.fieldErrors) setErrors((prev) => ({ ...prev, ...result.fieldErrors }));
      return;
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza los datos y confirma con tu contrasena actual."
              : "Completa los datos de la nueva cuenta y confirma con tu contrasena actual."}
          </DialogDescription>
        </DialogHeader>

        <SuperAdminFormSections draft={draft} errors={errors} isEdit={isEdit} setField={setField} />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isPending}
            className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            onClick={handleSubmit}
          >
            {isPending ? "Guardando..." : isEdit ? "Confirmar edicion" : "Crear super admin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
