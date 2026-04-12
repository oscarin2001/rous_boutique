"use client";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import { useRouter } from "next/navigation";

import {
  updateSuperAdminMeSecurityAction,
  validateSecurityInput,
  type EditableProfile,
} from "@/actions/super-admin/me";

import { FieldError } from "@/components/super-admin/dashboard/me/shared/field-error";
import { PasswordConfirmModal } from "@/components/super-admin/dashboard/me/shared/password-confirm-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

type Props = {
  profile: EditableProfile;
};

type SecurityErrors = ReturnType<typeof validateSecurityInput>;

type SecurityDraft = {
  username: string;
  newPassword: string;
  newPasswordConfirm: string;
};

function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}

function formatNextDate(value: string | null) {
  if (!value) return "fecha pendiente";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "fecha pendiente";
  return new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function SecurityForm({ profile }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<SecurityErrors>({});
  const [form, setForm] = useState<SecurityDraft>({
    username: profile.username,
    newPassword: "",
    newPasswordConfirm: "",
  });

  const hasChanges =
    form.username !== profile.username ||
    Boolean(form.newPassword.trim()) ||
    Boolean(form.newPasswordConfirm.trim());

  const clearFieldError = (field: keyof SecurityErrors) => {
    if (!errors[field]) return;
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const requestSave = () => {
    if (!profile.canChangeCredentials) {
      setSubmitMessage(`Podras cambiar credenciales nuevamente desde ${formatNextDate(profile.nextCredentialChangeAt)}.`);
      return;
    }

    if (!hasChanges) {
      setSubmitMessage("No hay cambios para guardar.");
      return;
    }

    const validationErrors = validateSecurityInput({
      ...form,
      currentPassword: "tmpPass123A",
    });
    validationErrors.currentPassword = undefined;
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) {
      setSubmitMessage(null);
      return;
    }

    setSubmitMessage(null);
    setConfirmError(null);
    setConfirmOpen(true);
  };

  const handleConfirmSave = (currentPassword: string) => {
    const input = {
      ...form,
      currentPassword,
    };

    const validationErrors = validateSecurityInput(input);
    const modalError = validationErrors.currentPassword;
    validationErrors.currentPassword = undefined;
    setErrors(validationErrors);

    if (hasErrors(validationErrors) || modalError) {
      setConfirmError(modalError ?? null);
      return;
    }

    setConfirmError(null);
    startTransition(async () => {
      const result = await updateSuperAdminMeSecurityAction(input);

      if (!result.success) {
        setConfirmError(result.error ?? "No se pudo actualizar seguridad");
        return;
      }

      toast.success("Credenciales actualizadas");
      setConfirmOpen(false);
      setForm((prev) => ({ ...prev, newPassword: "", newPasswordConfirm: "" }));
      router.refresh();
    });
  };

  return (
    <>
      <div className="space-y-6 rounded-2xl border border-border/60 bg-card p-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Credenciales de acceso</h2>
          <p className="text-sm text-muted-foreground">Puedes cambiar usuario y contrasena cada 3 meses.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="me-security-username">Usuario</Label>
            <Input
              id="me-security-username"
              value={form.username}
              placeholder="usuario.admin"
              minLength={3}
              maxLength={60}
              disabled={!profile.canChangeCredentials}
              onChange={(event) => {
                setForm((prev) => ({
                  ...prev,
                  username: event.target.value.toLowerCase().trimStart().slice(0, 60),
                }));
                clearFieldError("username");
              }}
            />
            <FieldError message={errors.username} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="me-security-new-password">Nueva contrasena</Label>
            <PasswordInput
              id="me-security-new-password"
              value={form.newPassword}
              placeholder="Opcional si solo cambias usuario"
              minLength={8}
              maxLength={72}
              disabled={!profile.canChangeCredentials}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, newPassword: event.target.value.slice(0, 72) }));
                clearFieldError("newPassword");
              }}
            />
            <FieldError message={errors.newPassword} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="me-security-new-password-confirm">Confirmar nueva contrasena</Label>
            <PasswordInput
              id="me-security-new-password-confirm"
              value={form.newPasswordConfirm}
              placeholder="Repite la nueva contrasena"
              minLength={8}
              maxLength={72}
              disabled={!profile.canChangeCredentials}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, newPasswordConfirm: event.target.value.slice(0, 72) }));
                clearFieldError("newPasswordConfirm");
              }}
            />
            <FieldError message={errors.newPasswordConfirm} />
          </div>
        </div>

        {submitMessage ? <p className="text-sm text-muted-foreground">{submitMessage}</p> : null}

        <div className="flex justify-end pt-1">
          <Button onClick={requestSave} disabled={isPending || !profile.canChangeCredentials}>
            Guardar cambios
          </Button>
        </div>
      </div>

      <PasswordConfirmModal
        open={confirmOpen}
        title="Confirmar cambios de seguridad"
        description="¿Estas seguro de confirmar estos cambios? Ingresa tu contrasena actual para continuar."
        sectionTitle="Editar seguridad"
        sectionSummary="Protege tu cuenta actualizando usuario y contrasena."
        policyNotice={`Al confirmar, el proximo cambio de esta seccion se habilitara en 3 meses. Proximo cambio disponible: ${formatNextDate(profile.nextCredentialChangeAt)}.`}
        confirmLabel="Si, confirmar cambios"
        isPending={isPending}
        errorMessage={confirmError}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmSave}
      />
    </>
  );
}
