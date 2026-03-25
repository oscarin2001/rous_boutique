"use client";

import { useEffect, useMemo, useState } from "react";

import { PlusCircle, SquarePen } from "lucide-react";

import type {
  ManagerActionResult,
  ManagerBranchOption,
  ManagerFormField,
  ManagerRow,
} from "@/actions/super-admin/managers/types";

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
import { HUMAN_NAME_REGEX, isValidIsoDate } from "@/lib/field-validation";
import { buildManagerEmail, MANAGER_USERNAME_REGEX, normalizeManagerUsername } from "@/lib/manager-email";

import { ManagerFormFields } from "./manager-form-fields";

type FieldErrors = Partial<Record<ManagerFormField, string>>;

type ManagerDraft = {
  firstName: string;
  lastName: string;
  ci: string;
  phone: string;
  emailUsername: string;
  password: string;
  passwordConfirm: string;
  receivesSalary: boolean;
  salary: string;
  homeAddress: string;
  birthDate: string;
  hireDate: string;
  branchIds: number[];
};

type ChangeItem = { label: string; from: string; to: string };

const MAX_MANAGERS_PER_BRANCH = 2;
const MAX_MANAGER_INCOME_BOB = 99999;
const MAX_HOME_ADDRESS_LENGTH = 120;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manager: ManagerRow | null;
  branchOptions: ManagerBranchOption[];
  onSubmit: (data: Record<string, unknown>, id?: number) => Promise<ManagerActionResult>;
  isPending: boolean;
}

function normalize(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function hasMinimumAgeIso(isoDate: string, years: number): boolean {
  const birthDate = new Date(`${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(birthDate.getTime())) return false;
  const today = new Date();
  const limitDate = new Date(Date.UTC(today.getUTCFullYear() - years, today.getUTCMonth(), today.getUTCDate()));
  return birthDate <= limitDate;
}

 
function buildDraft(formData: FormData): ManagerDraft {
  const branchIds = formData
    .getAll("branchIds")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  return {
    firstName: normalize(formData.get("firstName")),
    lastName: normalize(formData.get("lastName")),
    ci: normalize(formData.get("ci")),
    phone: normalize(formData.get("phone")),
    emailUsername: normalizeManagerUsername(normalize(formData.get("emailUsername"))),
    password: normalize(formData.get("password")),
    passwordConfirm: normalize(formData.get("passwordConfirm")),
    receivesSalary: normalize(formData.get("receivesSalary")) === "true",
    salary: normalize(formData.get("salary")),
    homeAddress: normalize(formData.get("homeAddress")),
    birthDate: normalize(formData.get("birthDate")),
    hireDate: normalize(formData.get("hireDate")),
    branchIds: Array.from(new Set(branchIds)),
  };
}

function sortedIdList(value: number[]) {
  return [...value].sort((a, b) => a - b);
}

function branchLabel(id: number, options: ManagerBranchOption[]) {
  const branch = options.find((item) => item.id === id);
  return branch ? `${branch.name} (${branch.city})` : `Sucursal #${id}`;
}

function summarizeChanges(
  manager: ManagerRow,
  draft: ManagerDraft,
  branchOptions: ManagerBranchOption[]
): ChangeItem[] {
  const original = {
    firstName: manager.firstName,
    lastName: manager.lastName,
    ci: manager.ci,
    phone: manager.phone ?? "",
    emailUsername: manager.email.split("@")[0] ?? "",
    receivesSalary: manager.receivesSalary,
    salary: String(manager.salary),
    homeAddress: manager.homeAddress ?? "",
    birthDate: manager.birthDate?.slice(0, 10) ?? "",
    hireDate: manager.hireDate.slice(0, 10),
    branchIds: sortedIdList(manager.branches.map((branch) => branch.id)),
  };

  const changes: ChangeItem[] = [];
  const present = (value: string | boolean): string => {
    if (typeof value === "boolean") return value ? "Si" : "No";
    return value || "-";
  };

  const fields: Array<{ key: keyof Omit<ManagerDraft, "password" | "passwordConfirm" | "branchIds">; label: string }> = [
    { key: "firstName", label: "Nombre" },
    { key: "lastName", label: "Apellido" },
    { key: "ci", label: "CI" },
    { key: "phone", label: "Telefono" },
    { key: "emailUsername", label: "Usuario de correo" },
    { key: "receivesSalary", label: "Pago de ingreso registrado" },
    { key: "salary", label: "Monto de ingreso" },
    { key: "homeAddress", label: "Direccion" },
    { key: "birthDate", label: "Fecha de nacimiento" },
    { key: "hireDate", label: "Fecha de ingreso" },
  ];

  for (const field of fields) {
    const from = present(original[field.key]);
    const to = present(draft[field.key]);
    if (from !== to) {
      changes.push({ label: field.label, from, to });
    }
  }

  if (draft.password) {
    changes.push({ label: "Contrasena", from: "Sin cambios", to: "Actualizada" });
  }

  const originalBranchIds = original.branchIds;
  const nextBranchIds = sortedIdList(draft.branchIds);

  const sameLength = originalBranchIds.length === nextBranchIds.length;
  const sameValues = sameLength && originalBranchIds.every((id, index) => id === nextBranchIds[index]);

  if (!sameValues) {
    const from = originalBranchIds.length
      ? originalBranchIds.map((id) => branchLabel(id, branchOptions)).join(", ")
      : "Sin sucursales";
    const to = nextBranchIds.length
      ? nextBranchIds.map((id) => branchLabel(id, branchOptions)).join(", ")
      : "Sin sucursales";

    changes.push({ label: "Sucursales", from, to });
  }

  return changes;
}

function toPayload(draft: ManagerDraft, confirmPassword?: string): Record<string, unknown> {
  const salaryNumber = draft.salary === "" ? 0 : Number(draft.salary);
  const resolvedSalary = draft.receivesSalary ? salaryNumber : 0;

  const payload: Record<string, unknown> = {
    firstName: draft.firstName,
    lastName: draft.lastName,
    ci: draft.ci,
    phone: draft.phone,
    email: buildManagerEmail(draft.emailUsername),
    receivesSalary: draft.receivesSalary,
    salary: Number.isFinite(resolvedSalary) ? resolvedSalary : draft.salary,
    homeAddress: draft.homeAddress,
    birthDate: draft.birthDate,
    hireDate: draft.hireDate,
    branchIds: draft.branchIds,
    passwordConfirm: draft.passwordConfirm,
  };

  if (draft.password) payload.password = draft.password;
  if (confirmPassword !== undefined) payload.adminConfirmPassword = confirmPassword;

  return payload;
}

export function ManagerFormDialog({
  open,
  onOpenChange,
  manager,
  branchOptions,
  onSubmit,
  isPending,
}: Props) {
  const isEdit = !!manager;
  const formKey = `${manager?.id ?? "new"}-${open ? "open" : "closed"}`;
  const [errors, setErrors] = useState<FieldErrors>({});
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [receivesSalary, setReceivesSalary] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [draft, setDraft] = useState<ManagerDraft | null>(null);
  const [changes, setChanges] = useState<ChangeItem[]>([]);
  const [confirmName, setConfirmName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedBranchIds(manager?.branches.map((branch) => branch.id) ?? []);
    setReceivesSalary(manager?.receivesSalary ?? true);
  }, [manager]);

  const managerExpectedName = useMemo(() => (manager ? manager.fullName.trim().toLowerCase() : ""), [manager]);

  const clearFieldError = (name: ManagerFormField) => {
    if (!errors[name]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = (data: ManagerDraft): FieldErrors => {
    const next: FieldErrors = {};

    if (data.firstName.length < 2) next.firstName = "Minimo 2 caracteres";
    if (data.firstName.length > 20) next.firstName = "Maximo 20 caracteres";
    if (data.firstName && !HUMAN_NAME_REGEX.test(data.firstName)) next.firstName = "Solo letras y separadores simples";

    if (data.lastName.length < 2) next.lastName = "Minimo 2 caracteres";
    if (data.lastName.length > 20) next.lastName = "Maximo 20 caracteres";
    if (data.lastName && !HUMAN_NAME_REGEX.test(data.lastName)) next.lastName = "Solo letras y separadores simples";

    if (data.ci.length < 5) next.ci = "Minimo 5 caracteres";
    if (data.ci.length > 20) next.ci = "Maximo 20 caracteres";
    if (!/^[A-Za-z0-9-]+$/.test(data.ci)) next.ci = "Solo letras, numeros y guion";

    if (data.phone && !/^[67]\d{7}$/.test(data.phone)) {
      next.phone = "Debe iniciar con 6 o 7 y tener 8 digitos";
    }

    if (!MANAGER_USERNAME_REGEX.test(data.emailUsername)) {
      next.email = "Usuario invalido (solo letras minusculas, numeros, ., _, -; minimo 3)";
    }

    if (!isEdit) {
      if (!data.password) next.password = "La contrasena es obligatoria";
      if (data.password.length > 0 && data.password.length < 8) next.password = "Minimo 8 caracteres";
      if (!/[A-Z]/.test(data.password)) next.password = "Debe incluir al menos una mayuscula";
      if (!data.passwordConfirm) next.passwordConfirm = "La confirmacion es obligatoria";
      if (data.passwordConfirm.length > 0 && data.passwordConfirm.length < 8) next.passwordConfirm = "Minimo 8 caracteres";
      if (data.password && data.passwordConfirm && data.password !== data.passwordConfirm) {
        next.passwordConfirm = "La confirmacion no coincide";
      }
    } else if (data.password) {
      if (data.password.length < 8) next.password = "Minimo 8 caracteres";
      if (!/[A-Z]/.test(data.password)) next.password = "Debe incluir al menos una mayuscula";
      if (!data.passwordConfirm) next.passwordConfirm = "Confirma la nueva contrasena";
      if (data.password && data.passwordConfirm && data.password !== data.passwordConfirm) {
        next.passwordConfirm = "La confirmacion no coincide";
      }
    } else if (data.passwordConfirm) {
      next.passwordConfirm = "Primero ingresa una nueva contrasena";
    }

    if (data.salary !== "") {
      const salary = Number(data.salary);
      if (!Number.isFinite(salary)) next.salary = "Monto de ingreso invalido";
      if (Number.isFinite(salary) && salary < 0) next.salary = "No puede ser negativo";
      if (Number.isFinite(salary) && salary > MAX_MANAGER_INCOME_BOB) next.salary = `No puede exceder Bs ${MAX_MANAGER_INCOME_BOB}`;
      if (!data.receivesSalary && salary > 0) next.salary = "Si no registra pago, el monto debe ser 0";
      if (data.receivesSalary && salary <= 0) next.salary = "Si registra pago, el monto debe ser mayor a 0";
    } else if (data.receivesSalary) {
      next.salary = "Si registra pago, el monto debe ser mayor a 0";
    }

    if (data.homeAddress.length > MAX_HOME_ADDRESS_LENGTH) next.homeAddress = `Maximo ${MAX_HOME_ADDRESS_LENGTH} caracteres`;

    if (!data.birthDate) next.birthDate = "Fecha de nacimiento obligatoria";
    if (data.birthDate && !isValidIsoDate(data.birthDate)) next.birthDate = "Fecha invalida";
    if (data.birthDate && isValidIsoDate(data.birthDate) && !hasMinimumAgeIso(data.birthDate, 18)) {
      next.birthDate = "Debe tener al menos 18 anos";
    }

    if (!data.hireDate) next.hireDate = "Fecha de ingreso obligatoria";
    if (data.hireDate && !isValidIsoDate(data.hireDate)) next.hireDate = "Fecha invalida";
    if (
      data.birthDate &&
      data.hireDate &&
      isValidIsoDate(data.birthDate) &&
      isValidIsoDate(data.hireDate) &&
      data.hireDate < data.birthDate
    ) {
      next.hireDate = "La fecha de ingreso no puede ser anterior a la fecha de nacimiento";
    }

    const currentBranchIds = new Set(manager?.branches.map((branch) => branch.id) ?? []);
    const overCapacitySelected = data.branchIds.some((branchId) => {
      const branch = branchOptions.find((option) => option.id === branchId);
      if (!branch) return false;
      if (currentBranchIds.has(branchId)) return false;
      return branch.assignedManagerCount >= MAX_MANAGERS_PER_BRANCH;
    });

    if (overCapacitySelected) {
      next.branchIds = ADMIN_VALIDATION_MESSAGES.maxManagersPerBranch;
    }

    return next;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("receivesSalary", String(receivesSalary));
    const nextDraft = buildDraft(formData);
    if (isEdit && manager && nextDraft.branchIds.length === 0) {
      nextDraft.branchIds = manager.branches.map((branch) => branch.id);
    }
    const nextErrors = validate(nextDraft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    if (isEdit && manager) {
      const nextChanges = summarizeChanges(manager, nextDraft, branchOptions);
      if (nextChanges.length === 0) {
        setConfirmMessage("No detectamos cambios para guardar.");
        return;
      }

      setDraft(nextDraft);
      setChanges(nextChanges);
      setStep(2);
      setConfirmMessage(null);
      return;
    }

    const result = await onSubmit(toPayload(nextDraft));
    if (!result.success && result.fieldErrors) {
      setErrors((prev) => ({ ...prev, ...result.fieldErrors }));
    }
  };

  const handleConfirmEdit = async () => {
    if (!manager || !draft) return;

    if (confirmName.trim().toLowerCase() !== managerExpectedName) {
      setConfirmMessage("Debes escribir exactamente el nombre del encargado.");
      return;
    }

    if (!confirmPassword.trim()) {
      setConfirmMessage(ADMIN_VALIDATION_MESSAGES.adminPasswordRequired);
      return;
    }

    setConfirmMessage(null);

    const result = await onSubmit(toPayload(draft, confirmPassword), manager.id);
    if (!result.success) {
      if (result.fieldErrors?.adminConfirmPassword) {
        setConfirmMessage(result.fieldErrors.adminConfirmPassword);
      } else {
        setConfirmMessage(result.error ?? "No se pudo confirmar la edicion.");
      }
    }
  };

  const resetDialog = () => {
    setErrors({});
    setStep(1);
    setDraft(null);
    setChanges([]);
    setConfirmName("");
    setConfirmPassword("");
    setConfirmMessage(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetDialog();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? <SquarePen className="size-5 text-primary" /> : <PlusCircle className="size-5 text-primary" />}
            {isEdit ? `Editar Encargado: ${manager?.fullName ?? ""}` : "Nuevo Encargado de sucursal"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? step === 1
                ? `Encargado seleccionado: ${manager?.fullName ?? "No disponible"}. Actualiza los datos y revisa los cambios antes de confirmar.`
                : `Confirma los cambios para ${manager?.fullName ?? "este encargado"} y valida con contrasena.`
              : "Completa los datos para crear un nuevo encargado."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
            <ManagerFormFields
              manager={manager}
              branchOptions={branchOptions}
              selectedBranchIds={selectedBranchIds}
              onSelectedBranchIdsChange={setSelectedBranchIds}
              receivesSalary={receivesSalary}
              onReceivesSalaryChange={setReceivesSalary}
              errors={errors}
              onFieldInput={clearFieldError}
              isEdit={isEdit}
            />

            {confirmMessage ? <p className="text-sm text-destructive">{confirmMessage}</p> : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : isEdit ? "Revisar Cambios" : "Crear Encargado de sucursal"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 rounded-lg border p-3">
              <h4 className="text-sm font-medium">Resumen de cambios</h4>
              <div className="max-h-52 space-y-2 overflow-y-auto text-sm">
                {changes.map((change) => (
                  <div key={`${change.label}-${change.from}-${change.to}`} className="rounded border p-2">
                    <p className="font-medium">{change.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {change.from} {"->"} {change.to}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager-edit-confirm-name">Escribe exactamente: {manager?.fullName ?? "-"}</Label>
              <Input
                id="manager-edit-confirm-name"
                value={confirmName}
                onChange={(event) => setConfirmName(event.target.value)}
                placeholder={manager?.fullName ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager-edit-confirm-password">Contrasena de administrador</Label>
              <PasswordInput
                id="manager-edit-confirm-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
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
                Atras
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="button" disabled={isPending} onClick={handleConfirmEdit}>
                {isPending ? "Confirmando..." : "Confirmar Edicion"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

