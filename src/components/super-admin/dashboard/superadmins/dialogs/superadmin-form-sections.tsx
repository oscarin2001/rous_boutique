"use client";

import type { SuperAdminFormField, SuperAdminRow } from "@/actions/super-admin/superadmins/types";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export type FieldErrors = Partial<Record<SuperAdminFormField, string>>;

export type SuperAdminDraft = {
  firstName: string;
  lastName: string;
  birthDate: string;
  ci: string;
  phone: string;
  username: string;
  password: string;
  passwordConfirm: string;
  newPassword: string;
  newPasswordConfirm: string;
  adminConfirmPassword: string;
};

export function toInitialDraft(superAdmin: SuperAdminRow | null): SuperAdminDraft {
  return {
    firstName: superAdmin?.firstName ?? "",
    lastName: superAdmin?.lastName ?? "",
    birthDate: superAdmin?.birthDate ?? "",
    ci: superAdmin?.ci ?? "",
    phone: superAdmin?.phone ?? "",
    username: superAdmin?.username ?? "",
    password: "",
    passwordConfirm: "",
    newPassword: "",
    newPasswordConfirm: "",
    adminConfirmPassword: "",
  };
}

export function SuperAdminFormSections({
  draft,
  errors,
  isEdit,
  setField,
}: {
  draft: SuperAdminDraft;
  errors: FieldErrors;
  isEdit: boolean;
  setField: <K extends keyof SuperAdminDraft>(field: K, value: SuperAdminDraft[K]) => void;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" value={draft.firstName} error={errors.firstName} onChange={(value) => setField("firstName", value)} />
        <Field label="Apellido" value={draft.lastName} error={errors.lastName} onChange={(value) => setField("lastName", value)} />
        <Field label="Fecha de nacimiento" type="date" value={draft.birthDate} error={errors.birthDate} onChange={(value) => setField("birthDate", value)} />
        <Field label="CI" value={draft.ci} error={errors.ci} onChange={(value) => setField("ci", value)} />
        <Field label="Telefono (Bolivia)" value={draft.phone} placeholder="71234567" error={errors.phone} onChange={(value) => setField("phone", value.replace(/\D/g, "").slice(0, 8))} />
        <Field label="Usuario" value={draft.username} placeholder="superadmin.usuario" error={errors.username} onChange={(value) => setField("username", value.toLowerCase().trim())} />
      </div>

      {!isEdit ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField label="Contrasena" value={draft.password} error={errors.password} onChange={(value) => setField("password", value)} />
          <PasswordField label="Confirmar contrasena" value={draft.passwordConfirm} error={errors.passwordConfirm} onChange={(value) => setField("passwordConfirm", value)} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField label="Nueva contrasena (opcional)" value={draft.newPassword} error={errors.newPassword} onChange={(value) => setField("newPassword", value)} />
          <PasswordField label="Confirmar nueva contrasena" value={draft.newPasswordConfirm} error={errors.newPasswordConfirm} onChange={(value) => setField("newPasswordConfirm", value)} />
        </div>
      )}

      <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
        <Label htmlFor="superadmin-admin-password">Confirmacion de seguridad</Label>
        <PasswordInput
          id="superadmin-admin-password"
          value={draft.adminConfirmPassword}
          onChange={(event) => setField("adminConfirmPassword", event.target.value)}
          placeholder="Ingresa tu contrasena actual"
        />
        <FieldError message={errors.adminConfirmPassword} />
      </div>
    </>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function Field({
  label,
  value,
  error,
  type = "text",
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      <FieldError message={error} />
    </div>
  );
}

function PasswordField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <PasswordInput value={value} onChange={(event) => onChange(event.target.value)} />
      <FieldError message={error} />
    </div>
  );
}
