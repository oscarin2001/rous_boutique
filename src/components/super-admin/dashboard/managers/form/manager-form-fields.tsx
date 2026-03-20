"use client";

import type {
  ManagerBranchOption,
  ManagerFormField,
  ManagerRow,
} from "@/actions/super-admin/managers/types";

import { Checkbox } from "@/components/ui/checkbox";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

import { HUMAN_NAME_REGEX } from "@/lib/field-validation";
import { MANAGER_EMAIL_DOMAIN, extractManagerUsername, normalizeManagerUsername } from "@/lib/manager-email";

type FieldErrors = Partial<Record<ManagerFormField, string>>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

const stripNewLines = (value: string) => value.replace(/[\n\r]/g, " ");
const stripInvalidNameChars = (value: string) => value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ '\-]/g, "");

interface Props {
  manager: ManagerRow | null;
  branchOptions: ManagerBranchOption[];
  selectedBranchIds: number[];
  onSelectedBranchIdsChange: (branchIds: number[]) => void;
  receivesSalary: boolean;
  onReceivesSalaryChange: (receivesSalary: boolean) => void;
  errors?: FieldErrors;
  onFieldInput?: (name: ManagerFormField) => void;
  isEdit: boolean;
}

export function ManagerFormFields({
  manager,
  branchOptions,
  selectedBranchIds,
  onSelectedBranchIdsChange,
  receivesSalary,
  onReceivesSalaryChange,
  errors,
  onFieldInput,
  isEdit,
}: Props) {
  const selectedSet = new Set(selectedBranchIds);

  const toggleBranch = (id: number) => {
    const next = selectedSet.has(id)
      ? selectedBranchIds.filter((branchId) => branchId !== id)
      : [...selectedBranchIds, id];

    onSelectedBranchIdsChange(next);
    onFieldInput?.("branchIds");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1 block" htmlFor="firstName">Nombre</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={manager?.firstName ?? ""}
            required
            minLength={2}
            maxLength={20}
            pattern={HUMAN_NAME_REGEX.source}
            title="Solo letras y separadores simples"
            onInput={(event) => {
              event.currentTarget.value = stripInvalidNameChars(stripNewLines(event.currentTarget.value)).slice(0, 20);
              onFieldInput?.("firstName");
            }}
          />
          <FieldError message={errors?.firstName} />
        </div>

        <div>
          <Label className="mb-1 block" htmlFor="lastName">Apellido</Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={manager?.lastName ?? ""}
            required
            minLength={2}
            maxLength={20}
            pattern={HUMAN_NAME_REGEX.source}
            title="Solo letras y separadores simples"
            onInput={(event) => {
              event.currentTarget.value = stripInvalidNameChars(stripNewLines(event.currentTarget.value)).slice(0, 20);
              onFieldInput?.("lastName");
            }}
          />
          <FieldError message={errors?.lastName} />
        </div>

        <div>
          <Label className="mb-1 block" htmlFor="ci">CI</Label>
          <Input
            id="ci"
            name="ci"
            defaultValue={manager?.ci ?? ""}
            required
            minLength={5}
            maxLength={20}
            onInput={(event) => {
              event.currentTarget.value = stripNewLines(event.currentTarget.value)
                .replace(/[^A-Za-z0-9-]/g, "")
                .slice(0, 20);
              onFieldInput?.("ci");
            }}
          />
          <FieldError message={errors?.ci} />
        </div>

        <div>
          <Label className="mb-1 block" htmlFor="phone">Telefono</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            defaultValue={manager?.phone ?? ""}
           
            pattern="[67][0-9]{7}"
            minLength={0}
            maxLength={8}
            onInput={(event) => {
              event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 8);
              onFieldInput?.("phone");
            }}
          />
          <FieldError message={errors?.phone} />
        </div>

        <div className="sm:col-span-2">
          <Label className="mb-1 block" htmlFor="email">Correo</Label>
          <div className="flex items-center rounded-md border border-input bg-background px-3">
            <Input
              id="email"
              name="emailUsername"
              type="text"
              required
              maxLength={40}
              defaultValue={manager ? extractManagerUsername(manager.email) : ""}
              className="border-0 bg-transparent px-0 focus-visible:ring-0"
              onInput={(event) => {
                event.currentTarget.value = normalizeManagerUsername(stripNewLines(event.currentTarget.value));
                onFieldInput?.("email");
              }}
            />
            <span className="text-sm text-muted-foreground">@{MANAGER_EMAIL_DOMAIN}</span>
          </div>
          <FieldError message={errors?.email} />
        </div>

        <div>
          <Label className="mb-1 block" htmlFor="password">{isEdit ? "Nueva contrasena (opcional)" : "Contrasena"}</Label>
          <PasswordInput
            id="password"
            name="password"
            required={!isEdit}
            minLength={isEdit ? undefined : 8}
            maxLength={72}
            onInput={() => onFieldInput?.("password")}
          />
          <FieldError message={errors?.password} />
        </div>

        <div>
          <Label className="mb-1 block" htmlFor="passwordConfirm">Confirmar contrasena</Label>
          <PasswordInput
            id="passwordConfirm"
            name="passwordConfirm"
            required={!isEdit}
            minLength={isEdit ? undefined : 8}
            maxLength={72}
            onInput={() => onFieldInput?.("passwordConfirm")}
          />
          <FieldError message={errors?.passwordConfirm} />
        </div>

        <div>
          <Label className="mb-1 block" htmlFor="birthDate">Fecha de nacimiento</Label>
          <DateInput
            id="birthDate"
            name="birthDate"
            min="1900-01-01"
            max="2100-12-31"
            defaultValue={manager?.birthDate?.slice(0, 10) ?? ""}
            required
            onInput={() => onFieldInput?.("birthDate")}
          />
          <FieldError message={errors?.birthDate} />
        </div>

        <div className="space-y-2">
          <Label className="mb-1 block" htmlFor="receivesSalary">Recibe salario</Label>
          <div className="flex items-center gap-2 rounded-md border border-input px-3 py-2">
            <Checkbox
              id="receivesSalary"
              checked={receivesSalary}
              onCheckedChange={(checked) => {
                onReceivesSalaryChange(checked === true);
                onFieldInput?.("receivesSalary");
              }}
            />
            <Label htmlFor="receivesSalary" className="cursor-pointer text-sm font-normal">
              {receivesSalary ? "Si, recibe salario" : "No, no recibe salario"}
            </Label>
          </div>
          <input type="hidden" name="receivesSalary" value={String(receivesSalary)} />
          <FieldError message={errors?.receivesSalary} />
        </div>

        <div>
          <Label className="mb-1 block" htmlFor="salary">Salario (BOL)</Label>
          <Input
            id="salary"
            name="salary"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            defaultValue={String(manager?.salary ?? 0)}
            disabled={!receivesSalary}
            onInput={() => onFieldInput?.("salary")}
          />
          <FieldError message={errors?.salary} />
        </div>

        <div className="sm:col-span-2">
          <Label className="mb-1 block" htmlFor="homeAddress">Direccion</Label>
          <Input
            id="homeAddress"
            name="homeAddress"
            defaultValue={manager?.homeAddress ?? ""}
            maxLength={160}
            onInput={(event) => {
              event.currentTarget.value = stripNewLines(event.currentTarget.value).slice(0, 160);
              onFieldInput?.("homeAddress");
            }}
          />
          <FieldError message={errors?.homeAddress} />
        </div>

        <div>
          <Label className="mb-1 block" htmlFor="hireDate">Fecha de ingreso</Label>
          <DateInput
            id="hireDate"
            name="hireDate"
            min="1900-01-01"
            max="2100-12-31"
            defaultValue={manager?.hireDate.slice(0, 10) ?? ""}
            required
            onInput={() => onFieldInput?.("hireDate")}
          />
          <FieldError message={errors?.hireDate} />
        </div>
      </div>

      <div className="space-y-2 rounded-lg border p-3">
        <Label className="text-sm">Sucursales asignadas</Label>
        {branchOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay sucursales disponibles.</p>
        ) : (
          <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
            {branchOptions.map((branch) => {
              const isChecked = selectedSet.has(branch.id);
              const id = `branch-${branch.id}`;
              return (
                <div
                  key={branch.id}
                  className="flex items-center gap-2 rounded px-1 py-1.5 transition-colors hover:bg-muted/40"
                >
                  <Checkbox
                    id={id}
                    checked={isChecked}
                    onCheckedChange={() => toggleBranch(branch.id)}
                  />
                  <Label
                    htmlFor={id}
                    className="flex-1 cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {branch.name} - {branch.city}
                    {branch.assignedManagerCount > 0 ? (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({branch.assignedManagerCount} encargado(s))
                      </span>
                    ) : null}
                  </Label>
                </div>
              );
            })}
          </div>
        )}
        {selectedBranchIds.map((branchId) => (
          <input key={branchId} type="hidden" name="branchIds" value={String(branchId)} />
        ))}
        <FieldError message={errors?.branchIds} />
      </div>
    </div>
  );
}

