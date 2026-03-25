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

const MAX_MANAGER_INCOME_BOB = 99999;
const MAX_HOME_ADDRESS_LENGTH = 120;

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
  void branchOptions;
  void onSelectedBranchIdsChange;

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
            onValueChange={() => onFieldInput?.("birthDate")}
          />
          <FieldError message={errors?.birthDate} />
        </div>

        <div className="space-y-2">
          <Label className="mb-1 block" htmlFor="receivesSalary">Registro de pago de ingreso</Label>
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
              {receivesSalary ? "Si, pago de ingreso registrado" : "No, sin pago de ingreso"}
            </Label>
          </div>
          <input type="hidden" name="receivesSalary" value={String(receivesSalary)} />
          <FieldError message={errors?.receivesSalary} />
        </div>

        <div>
          <Label className="mb-1 block" htmlFor="salary">Monto de ingreso (BOL)</Label>
          <Input
            id="salary"
            name="salary"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            max={String(MAX_MANAGER_INCOME_BOB)}
            defaultValue={String(manager?.salary ?? 0)}
            disabled={!receivesSalary}
            onInput={(event) => {
              const value = Number(event.currentTarget.value);
              if (Number.isFinite(value) && value > MAX_MANAGER_INCOME_BOB) {
                event.currentTarget.value = String(MAX_MANAGER_INCOME_BOB);
              }
              onFieldInput?.("salary");
            }}
          />
          <FieldError message={errors?.salary} />
        </div>

        <div className="sm:col-span-2">
          <Label className="mb-1 block" htmlFor="homeAddress">Dirección de residencia</Label>
          <Input
            id="homeAddress"
            name="homeAddress"
            defaultValue={manager?.homeAddress ?? ""}
            maxLength={MAX_HOME_ADDRESS_LENGTH}
            onInput={(event) => {
              event.currentTarget.value = stripNewLines(event.currentTarget.value).slice(0, MAX_HOME_ADDRESS_LENGTH);
              onFieldInput?.("homeAddress");
            }}
          />
          <FieldError message={errors?.homeAddress} />
        </div>

        <div>
          <Label className="mb-1 block" htmlFor="hireDate">Fecha de ingreso a la empresa</Label>
          <DateInput
            id="hireDate"
            name="hireDate"
            min="1900-01-01"
            max="2100-12-31"
            defaultValue={manager?.hireDate.slice(0, 10) ?? ""}
            required
            onValueChange={() => onFieldInput?.("hireDate")}
          />
          <FieldError message={errors?.hireDate} />
        </div>
      </div>

      {selectedBranchIds.map((branchId) => (
        <input key={branchId} type="hidden" name="branchIds" value={String(branchId)} />
      ))}
    </div>
  );
}

