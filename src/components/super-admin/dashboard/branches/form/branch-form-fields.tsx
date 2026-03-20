"use client";

import { useEffect, useState } from "react";

import type {
  BranchFormField,
  BranchManagerOption,
  BranchRow,
} from "@/actions/super-admin/branches/types";

import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { BOLIVIA_COUNTRY, BOLIVIA_DEPARTMENTS } from "@/lib/bolivia";
import { PLACE_NAME_REGEX } from "@/lib/field-validation";

type FieldErrors = Partial<Record<BranchFormField, string>>;
const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null;
const stripNewLines = (v: string) => v.replace(/[\n\r]/g, " ");
const stripInvalidPlaceChars = (v: string) => v.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ .'-]/g, "");

export function BranchFormFields({
  branch,
  managerOptions,
  errors,
  onFieldInput,
  isEdit,
}: {
  branch: BranchRow | null;
  managerOptions: BranchManagerOption[];
  errors?: FieldErrors;
  onFieldInput?: (name: BranchFormField) => void;
  isEdit: boolean;
}) {
  const [department, setDepartment] = useState(branch?.department ?? "");
  const [managerId, setManagerId] = useState(branch?.manager?.id ? String(branch.manager.id) : "none");
  useEffect(() => setDepartment(branch?.department ?? ""), [branch?.department]);
  useEffect(() => setManagerId(branch?.manager?.id ? String(branch.manager.id) : "none"), [branch?.manager?.id]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label className="mb-1 block" htmlFor="name">Nombre de la sucursal</Label>
        <Input id="name" name="name" defaultValue={branch?.name ?? ""} required minLength={2} maxLength={100} pattern={PLACE_NAME_REGEX.source} title="Solo letras y separadores simples" onInput={(e) => { e.currentTarget.value = stripInvalidPlaceChars(stripNewLines(e.currentTarget.value)).slice(0, 100); onFieldInput?.("name"); }} />
        <FieldError message={errors?.name} />
      </div>
      <div>
        <Label className="mb-1 block" htmlFor="phone">Telefono</Label>
        <Input id="phone" name="phone" type="tel" inputMode="numeric" defaultValue={branch?.phone ?? ""} required pattern="[67][0-9]{7}" title="Debe iniciar con 6 o 7 y tener 8 digitos" minLength={8} maxLength={8} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 8); onFieldInput?.("phone"); }} />
        <FieldError message={errors?.phone} />
      </div>
      <div>
        <Label className="mb-1 block" htmlFor="nit">NIT (opcional)</Label>
        <Input id="nit" name="nit" defaultValue={branch?.nit ?? ""} maxLength={20} onInput={(e) => { e.currentTarget.value = stripNewLines(e.currentTarget.value).slice(0, 20); onFieldInput?.("nit"); }} />
      </div>
      <div className="sm:col-span-2">
        <Label className="mb-1 block" htmlFor="address">Direccion</Label>
        <Input id="address" name="address" defaultValue={branch?.address ?? ""} required minLength={3} maxLength={120} onInput={(e) => { e.currentTarget.value = stripNewLines(e.currentTarget.value).slice(0, 120); onFieldInput?.("address"); }} />
        <FieldError message={errors?.address} />
      </div>
      <div>
        <Label className="mb-1 block" htmlFor="city">Ciudad</Label>
        <Input id="city" name="city" defaultValue={branch?.city ?? ""} required minLength={2} maxLength={50} pattern={PLACE_NAME_REGEX.source} title="Solo letras y separadores simples" onInput={(e) => { e.currentTarget.value = stripInvalidPlaceChars(stripNewLines(e.currentTarget.value)).slice(0, 50); onFieldInput?.("city"); }} />
        <FieldError message={errors?.city} />
      </div>
      <div>
        <Label className="mb-1 block" htmlFor="department">Departamento</Label>
        <Select value={department} onValueChange={(value) => { setDepartment(value ?? ""); onFieldInput?.("department"); }}>
          <SelectTrigger id="department" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>{BOLIVIA_DEPARTMENTS.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}</SelectContent>
        </Select>
        <input type="hidden" name="department" value={department} />
        <FieldError message={errors?.department} />
      </div>
      <div>
        <Label className="mb-1 block" htmlFor="managerId">Gerente</Label>
        <Select value={managerId} onValueChange={(value) => { setManagerId(value ?? "none"); onFieldInput?.("managerId"); }}>
          <SelectTrigger id="managerId" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              {managerOptions.length === 0 ? "Sin gerentes creados aun" : "Sin gerente"}
            </SelectItem>
            {managerOptions.map((manager) => (
              <SelectItem key={manager.id} value={String(manager.id)}>
                {manager.name}
                {manager.assignedBranchId && manager.assignedBranchId !== branch?.id
                  ? ` (Asignado: ${manager.assignedBranchName})`
                  : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="managerId" value={managerId === "none" ? "" : managerId} />
        <FieldError message={errors?.managerId} />
      </div>
      <div>
        <Label className="mb-1 block" htmlFor="country">Pais</Label>
        <Input id="country" value={BOLIVIA_COUNTRY} disabled className="bg-muted" />
      </div>
      <input type="hidden" name="country" value={BOLIVIA_COUNTRY} />
      <div>
        <Label className="mb-1 block" htmlFor="openedAt">Fecha de apertura</Label>
        <DateInput id="openedAt" name="openedAt" min="1900-01-01" max="2100-12-31" required={!isEdit} defaultValue={branch?.openedAt?.slice(0, 10) ?? ""} onInput={() => onFieldInput?.("openedAt")} />
        <FieldError message={errors?.openedAt} />
      </div>
      <div>
        <Label className="mb-1 block" htmlFor="googleMaps">Ubicacion en Google Maps</Label>
        <Input id="googleMaps" name="googleMaps" type="url" defaultValue={branch?.googleMaps ?? ""} maxLength={300} onInput={(e) => { e.currentTarget.value = stripNewLines(e.currentTarget.value).slice(0, 300); onFieldInput?.("googleMaps"); }} />
      </div>
    </div>
  );
}

