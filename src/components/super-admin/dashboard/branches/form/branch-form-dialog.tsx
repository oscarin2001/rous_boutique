"use client";

import { useState } from "react";

import { PlusCircle, SquarePen } from "lucide-react";

import type {
  BranchActionResult,
  BranchManagerOption,
  BranchFormField,
  BranchRow,
} from "@/actions/super-admin/branches/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

import { PLACE_NAME_REGEX, isValidIsoDate } from "@/lib/field-validation";

import { BranchFormFields } from "./branch-form-fields";


interface BranchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: BranchRow | null;
  managerOptions: BranchManagerOption[];
  onSubmit: (formData: FormData) => Promise<BranchActionResult>;
  isPending: boolean;
}

function isValidOpenedAt(value: string): boolean {
  return !value || isValidIsoDate(value);
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

type FieldErrors = Partial<Record<BranchFormField, string>>;
type DraftData = {
  name: string;
  nit: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  country: string;
  googleMaps: string;
  managerId: string;
  openedAt: string;
};

type ChangeItem = { label: string; from: string; to: string };

function normalize(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function buildDraft(formData: FormData): DraftData {
  return {
    name: normalize(formData.get("name")),
    nit: normalize(formData.get("nit")),
    phone: normalize(formData.get("phone")),
    address: normalize(formData.get("address")),
    city: normalize(formData.get("city")),
    department: normalize(formData.get("department")),
    country: normalize(formData.get("country")),
    googleMaps: normalize(formData.get("googleMaps")),
    managerId: normalize(formData.get("managerId")),
    openedAt: normalize(formData.get("openedAt")),
  };
}

function managerLabel(managerId: string, managerOptions: BranchManagerOption[]) {
  if (!managerId) return "Sin gerente";
  const id = Number(managerId);
  const manager = managerOptions.find((option) => option.id === id);
  return manager?.name ?? "Gerente no encontrado";
}

function summarizeChanges(
  branch: BranchRow,
  draft: DraftData,
  managerOptions: BranchManagerOption[]
): ChangeItem[] {
  const currentManagerId = branch.manager?.id ? String(branch.manager.id) : "";
  const original: DraftData = {
    name: branch.name,
    nit: branch.nit ?? "",
    phone: branch.phone ?? "",
    address: branch.address,
    city: branch.city,
    department: branch.department ?? "",
    country: branch.country,
    googleMaps: branch.googleMaps ?? "",
    managerId: currentManagerId,
    openedAt: branch.openedAt?.slice(0, 10) ?? "",
  };

  const fields: Array<{ key: keyof DraftData; label: string }> = [
    { key: "name", label: "Nombre" },
    { key: "nit", label: "NIT" },
    { key: "phone", label: "Teléfono" },
    { key: "address", label: "Dirección" },
    { key: "city", label: "Ciudad" },
    { key: "department", label: "Departamento" },
    { key: "googleMaps", label: "Google Maps" },
    { key: "managerId", label: "Gerente" },
    { key: "openedAt", label: "Fecha de apertura" },
  ];

  const changes: ChangeItem[] = [];
  for (const field of fields) {
    const from = original[field.key];
    const to = draft[field.key];
    if (from === to) continue;

    if (field.key === "managerId") {
      changes.push({
        label: field.label,
        from: managerLabel(from, managerOptions),
        to: managerLabel(to, managerOptions),
      });
      continue;
    }

    changes.push({
      label: field.label,
      from: from || "—",
      to: to || "—",
    });
  }

  return changes;
}

export function BranchFormDialog({
  open,
  onOpenChange,
  branch,
  managerOptions,
  onSubmit,
  isPending,
}: BranchFormDialogProps) {
  const isEdit = !!branch;
  const formKey = `${branch?.id ?? "new"}-${open ? "open" : "closed"}`;
  const [errors, setErrors] = useState<FieldErrors>({});
  const [step, setStep] = useState<1 | 2>(1);
  const [changes, setChanges] = useState<ChangeItem[]>([]);
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);

  const validate = (formData: FormData): FieldErrors => {
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").replace(/\D/g, "");
    const address = String(formData.get("address") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const department = String(formData.get("department") ?? "").trim();
    const openedAt = String(formData.get("openedAt") ?? "").trim();

    const next: FieldErrors = {};
    if (name.length < 2) next.name = "Minimo 2 caracteres";
    if (name.length > 100) next.name = "Maximo 100 caracteres";
    if (name && !PLACE_NAME_REGEX.test(name)) next.name = "Solo letras y separadores simples";
    if (!/^[67]\d{7}$/.test(phone)) next.phone = "Debe iniciar con 6 o 7 y tener 8 digitos";
    if (address.length < 3) next.address = "Minimo 3 caracteres";
    if (address.length > 120) next.address = "Maximo 120 caracteres";
    if (city.length < 2) next.city = "Minimo 2 caracteres";
    if (city.length > 50) next.city = "Maximo 50 caracteres";
    if (city && !PLACE_NAME_REGEX.test(city)) next.city = "Solo letras y separadores simples";
    if (!department) next.department = "Selecciona un departamento";
    if (!isEdit && !openedAt) next.openedAt = "La fecha de apertura es obligatoria";
    if (!isValidOpenedAt(openedAt)) next.openedAt = "Fecha de apertura invalida";
    return next;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextDraft = buildDraft(formData);
    const nextErrors = validate(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (isEdit && branch) {
      const nextChanges = summarizeChanges(branch, nextDraft, managerOptions);
      if (nextChanges.length === 0) {
        setConfirmMessage("No detectamos cambios para guardar.");
        return;
      }
      setConfirmMessage(null);
      setChanges(nextChanges);
      setDraft(nextDraft);
      setStep(2);
      return;
    }

    const result = await onSubmit(formData);
    if (!result.success && result.fieldErrors) {
      setErrors((prev) => ({ ...prev, ...result.fieldErrors }));
    }
  };

  const handleConfirmEdit = async () => {
    if (!branch || !draft) return;
    if (confirmName.trim().toLowerCase() !== branch.name.trim().toLowerCase()) {
      setConfirmMessage("Debes escribir exactamente el nombre de la sucursal.");
      return;
    }
    if (!confirmPassword.trim()) {
      setConfirmMessage("Ingresa la contraseña de confirmación.");
      return;
    }

    setConfirmMessage(null);
    const payload = new FormData();
    payload.set("id", String(branch.id));
    payload.set("name", draft.name);
    payload.set("nit", draft.nit);
    payload.set("phone", draft.phone);
    payload.set("address", draft.address);
    payload.set("city", draft.city);
    payload.set("department", draft.department);
    payload.set("country", draft.country);
    payload.set("googleMaps", draft.googleMaps);
    payload.set("managerId", draft.managerId);
    payload.set("openedAt", draft.openedAt);
    payload.set("confirmPassword", confirmPassword);

    const result = await onSubmit(payload);
    if (!result.success) {
      if (result.fieldErrors?.confirmPassword) {
        setConfirmMessage(result.fieldErrors.confirmPassword);
      } else {
        setConfirmMessage(result.error ?? "No se pudo confirmar la edición.");
      }
    }
  };

  const clearFieldError = (name: keyof FieldErrors) => {
    if (!errors[name]) return;
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setErrors({});
          setStep(1);
          setChanges([]);
          setDraft(null);
          setConfirmName("");
          setConfirmPassword("");
          setConfirmMessage(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? <SquarePen className="size-5 text-primary" /> : <PlusCircle className="size-5 text-primary" />}
            {isEdit ? "Editar Sucursal" : "Nueva Sucursal"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? step === 1
                ? "Modifica los datos y revisa los cambios antes de confirmar."
                : "Confirma los cambios y valida con contraseña."
              : "Completa todos los datos para crear la sucursal."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <form key={formKey} onSubmit={handleSubmit}>
            {branch && <input type="hidden" name="id" value={branch.id} />}
            <BranchFormFields branch={branch} managerOptions={managerOptions} errors={errors} onFieldInput={clearFieldError} isEdit={isEdit} />
            {isEdit && branch ? (
              <div className="mt-4 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">Trazabilidad</p>
                <p>Creado por: {branch.createdByName ?? "No disponible"}</p>
                <p>Creado el: {fmtDateTime(branch.createdAt)}</p>
                <p>Actualizado por: {branch.updatedByName ?? "No disponible"}</p>
                <p>Actualizado el: {fmtDateTime(branch.updatedAt)}</p>
              </div>
            ) : null}
            {confirmMessage ? <p className="mt-3 text-sm text-destructive">{confirmMessage}</p> : null}
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Guardando..."
                  : isEdit
                    ? "Revisar Cambios"
                    : "Crear Sucursal"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 rounded-lg border p-3">
              <h4 className="text-sm font-medium">Resumen de cambios</h4>
              <div className="max-h-48 space-y-2 overflow-y-auto text-sm">
                {changes.map((change) => (
                  <div key={`${change.label}-${change.from}-${change.to}`} className="rounded border p-2">
                    <p className="font-medium">{change.label}</p>
                    <p className="text-xs text-muted-foreground">{change.from} → {change.to}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-name">Escribe el nombre de la sucursal para confirmar</Label>
              <Input id="confirm-name" value={confirmName} onChange={(event) => setConfirmName(event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Contraseña de administrador</Label>
              <PasswordInput id="confirm-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            </div>

            {confirmMessage ? <p className="text-sm text-destructive">{confirmMessage}</p> : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setConfirmMessage(null);
                }}
              >
                Atrás
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="button" disabled={isPending} onClick={handleConfirmEdit}>
                {isPending ? "Confirmando..." : "Confirmar Edición"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

