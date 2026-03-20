import { useEffect, useState } from "react";

import type { WarehouseOptionBranch, WarehouseOptionManager, WarehouseRow } from "@/actions/super-admin/warehouses/types";

import { Checkbox } from "@/components/ui/checkbox";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ADMIN_VALIDATION_MESSAGES } from "@/lib/admin-validation-messages";
import { BOLIVIA_COUNTRY, BOLIVIA_DEPARTMENTS } from "@/lib/bolivia";
import { PLACE_NAME_REGEX } from "@/lib/field-validation";

import type { FieldErrors } from "./warehouse-form-types";


interface Props {
  row: WarehouseRow | null;
  branches: WarehouseOptionBranch[];
  managers: WarehouseOptionManager[];
  selectedBranchIds: number[];
  selectedManagerIds: number[];
  onSelectedBranchIdsChange: (ids: number[]) => void;
  onSelectedManagerIdsChange: (ids: number[]) => void;
  errors: FieldErrors;
}

export function WarehouseFormFields({ row, branches, managers, selectedBranchIds, selectedManagerIds, onSelectedBranchIdsChange, onSelectedManagerIdsChange, errors }: Props) {
  const stripNewLines = (value: string) => value.replace(/[\n\r]/g, " ");
  const cleanPlace = (value: string) => value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ .'-]/g, "");
  const [department, setDepartment] = useState(row?.department || "");
  const [openedAt, setOpenedAt] = useState(row?.openedAt || "");

  useEffect(() => {
    setDepartment(row?.department || "");
  }, [row?.department]);

  useEffect(() => {
    setOpenedAt(row?.openedAt || "");
  }, [row?.openedAt]);

  const toggle = (value: number, selected: number[], onChange: (ids: number[]) => void) => {
    onChange(selected.includes(value) ? selected.filter((id) => id !== value) : [...selected, value]);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label className="mb-1 block" htmlFor="name">Nombre</Label><Input id="name" name="name" defaultValue={row?.name || ""} required minLength={2} maxLength={80} pattern={PLACE_NAME_REGEX.source} title="Solo letras y separadores simples" onInput={(e) => { e.currentTarget.value = cleanPlace(stripNewLines(e.currentTarget.value)).slice(0, 80); }} />{errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}</div>
        <div><Label className="mb-1 block" htmlFor="phone">Telefono</Label><Input id="phone" name="phone" defaultValue={row?.phone || ""} type="tel" inputMode="numeric" pattern="[67][0-9]{7}" title="Debe iniciar con 6 o 7 y tener 8 digitos" maxLength={8} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 8); }} />{errors.phone ? <p className="text-xs text-destructive">{errors.phone}</p> : null}</div>
        <div className="sm:col-span-2"><Label className="mb-1 block" htmlFor="address">Ubicacion</Label><Input id="address" name="address" defaultValue={row?.address || ""} required minLength={5} maxLength={300} onInput={(e) => { e.currentTarget.value = stripNewLines(e.currentTarget.value).slice(0, 300); }} />{errors.address ? <p className="text-xs text-destructive">{errors.address}</p> : null}</div>
        <div><Label className="mb-1 block" htmlFor="city">Ciudad</Label><Input id="city" name="city" defaultValue={row?.city || ""} required minLength={2} maxLength={50} pattern={PLACE_NAME_REGEX.source} title="Solo letras y separadores simples" onInput={(e) => { e.currentTarget.value = cleanPlace(stripNewLines(e.currentTarget.value)).slice(0, 50); }} />{errors.city ? <p className="text-xs text-destructive">{errors.city}</p> : null}</div>
        <div><Label className="mb-1 block" htmlFor="department">Departamento</Label><Select value={department} onValueChange={(value) => setDepartment(value ?? "")}><SelectTrigger id="department" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{BOLIVIA_DEPARTMENTS.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}</SelectContent></Select><input type="hidden" name="department" value={department} />{errors.department ? <p className="text-xs text-destructive">{errors.department}</p> : null}</div>
        <div><Label className="mb-1 block" htmlFor="country">Pais</Label><Input id="country" value={BOLIVIA_COUNTRY} disabled className="bg-muted" /><input type="hidden" name="country" value={BOLIVIA_COUNTRY} />{errors.country ? <p className="text-xs text-destructive">{errors.country}</p> : null}</div>
        <div><Label className="mb-1 block" htmlFor="openedAt">Fecha apertura</Label><DateInput id="openedAt" name="openedAt" min="1900-01-01" max="2100-12-31" value={openedAt} onValueChange={setOpenedAt} />{errors.openedAt ? <p className="text-xs text-destructive">{errors.openedAt}</p> : null}</div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-muted/20 p-3"><p className="mb-2 text-sm font-medium">Sucursales</p>{branches.map((b) => <label key={b.id} className="flex items-center gap-2 py-1 text-sm"><Checkbox checked={selectedBranchIds.includes(b.id)} onCheckedChange={() => toggle(b.id, selectedBranchIds, onSelectedBranchIdsChange)} />{b.name} ({b.city})</label>)}{selectedBranchIds.map((id) => <input key={id} type="hidden" name="branchIds" value={id} />)}<p className="mt-1 text-[11px] text-muted-foreground">{ADMIN_VALIDATION_MESSAGES.branchRequired}</p>{errors.branchIds ? <p className="text-xs text-destructive">{errors.branchIds}</p> : null}</div>
        <div className="rounded-lg bg-muted/20 p-3"><p className="mb-2 text-sm font-medium">Encargados</p>{managers.map((m) => <label key={m.id} className="flex items-center gap-2 py-1 text-sm"><Checkbox checked={selectedManagerIds.includes(m.id)} onCheckedChange={() => toggle(m.id, selectedManagerIds, onSelectedManagerIdsChange)} />{m.fullName}</label>)}{selectedManagerIds.map((id) => <input key={id} type="hidden" name="managerIds" value={id} />)}{errors.managerIds ? <p className="text-xs text-destructive">{errors.managerIds}</p> : null}</div>
      </div>
    </div>
  );
}

