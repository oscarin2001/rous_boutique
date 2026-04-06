"use client";

import { useEffect, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { HUMAN_NAME_REGEX, PLACE_NAME_REGEX } from "@/lib/field-validation";

import type { FieldErrors } from "./supplier-form-types";


interface Props {
  supplier: {
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    department?: string | null;
    ci?: string | null;
    country?: string | null;
    birthDate?: string | null;
    partnerSince?: string | null;
    contractEndAt?: string | null;
    isIndefinite?: boolean;
    notes?: string | null;
  } | null;
  errors?: FieldErrors;
  onFieldInput?: (name: keyof FieldErrors) => void;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null;
}

export function SupplierBasicCoreFields({ supplier, errors, onFieldInput }: Props) {
  const [isIndefinite, setIsIndefinite] = useState<boolean>(supplier?.isIndefinite ?? false);
  const stripNewLines = (value: string) => value.replace(/[\n\r]/g, " ");
  const cleanName = (value: string) => value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ '\-]/g, "");
  const cleanPlace = (value: string) => value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ .'-]/g, "");

  useEffect(() => {
    setIsIndefinite(supplier?.isIndefinite ?? false);
  }, [supplier?.isIndefinite]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label className="mb-1 block" htmlFor="firstName">Nombre(s)</Label>
        <Input id="firstName" name="firstName" defaultValue={supplier?.firstName ?? ""} required minLength={2} maxLength={50} pattern={HUMAN_NAME_REGEX.source} title="Solo letras y separadores simples" onInput={(e) => { e.currentTarget.value = cleanName(stripNewLines(e.currentTarget.value)).slice(0, 50); onFieldInput?.("firstName"); }} />
      </div>
      <div>
        <Label className="mb-1 block" htmlFor="lastName">Apellido(s)</Label>
        <Input id="lastName" name="lastName" defaultValue={supplier?.lastName ?? ""} required minLength={2} maxLength={50} pattern={HUMAN_NAME_REGEX.source} title="Solo letras y separadores simples" onInput={(e) => { e.currentTarget.value = cleanName(stripNewLines(e.currentTarget.value)).slice(0, 50); onFieldInput?.("lastName"); }} />
      </div>
      <div>
        <Label className="mb-1 block" htmlFor="phone">Telefono / WhatsApp</Label>
        <Input id="phone" name="phone" type="tel" inputMode="numeric" defaultValue={supplier?.phone ?? ""} pattern="[67][0-9]{7}" title="Debe iniciar con 6 o 7 y tener 8 digitos" maxLength={8} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 8); onFieldInput?.("phone"); }} />
      </div>
      <div>
        <Label className="mb-1 block" htmlFor="email">Correo Electronico</Label>
        <Input id="email" name="email" type="email" defaultValue={supplier?.email ?? ""} maxLength={80} onInput={(e) => { e.currentTarget.value = stripNewLines(e.currentTarget.value).slice(0, 80); onFieldInput?.("email"); }} />
      </div>
      <div className="sm:col-span-2">
        <Label className="mb-1 block" htmlFor="address">Direccion Fisica</Label>
        <Input id="address" name="address" defaultValue={supplier?.address ?? ""} maxLength={160} onInput={(e) => { e.currentTarget.value = stripNewLines(e.currentTarget.value).slice(0, 160); onFieldInput?.("address"); }} />
      </div>
      <div>
        <Label className="mb-1 block" htmlFor="city">Ciudad</Label>
        <Input id="city" name="city" defaultValue={supplier?.city ?? ""} maxLength={50} pattern={PLACE_NAME_REGEX.source} title="Solo letras y separadores simples" onInput={(e) => { e.currentTarget.value = cleanPlace(stripNewLines(e.currentTarget.value)).slice(0, 50); onFieldInput?.("city"); }} />
      </div>
    </div>
  );
}

export function SupplierBasicExtraFields({ supplier, errors, onFieldInput }: Props) {
  const [isIndefinite, setIsIndefinite] = useState<boolean>(supplier?.isIndefinite ?? false);
  const stripNewLines = (value: string) => value.replace(/[\n\r]/g, " ");
  const cleanPlace = (value: string) => value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ .'-]/g, "");
  const cleanCi = (value: string) => value.replace(/[^A-Za-z0-9-]/g, "");

  useEffect(() => {
    setIsIndefinite(supplier?.isIndefinite ?? false);
  }, [supplier?.isIndefinite]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label className="mb-1 block" htmlFor="department">Departamento / Estado</Label>
        <Input id="department" name="department" defaultValue={supplier?.department ?? ""} maxLength={50} pattern={PLACE_NAME_REGEX.source} title="Solo letras y separadores simples" onInput={(e) => { e.currentTarget.value = cleanPlace(stripNewLines(e.currentTarget.value)).slice(0, 50); onFieldInput?.("department"); }} />
      </div>
      <div>
        <Label className="mb-1 block" htmlFor="ci">Cedula de Identidad (CI)</Label>
        <Input id="ci" name="ci" defaultValue={supplier?.ci ?? ""} maxLength={20} pattern="[A-Za-z0-9-]+" title="Solo letras, numeros y guion" onInput={(e) => { e.currentTarget.value = cleanCi(stripNewLines(e.currentTarget.value)).slice(0, 20); onFieldInput?.("ci"); }} />
      </div>
      <div>
        <Label className="mb-1 block" htmlFor="country">Pais</Label>
        <Input id="country" name="country" defaultValue={supplier?.country ?? "Bolivia"} maxLength={50} pattern={PLACE_NAME_REGEX.source} title="Solo letras y separadores simples" onInput={(e) => { e.currentTarget.value = cleanPlace(stripNewLines(e.currentTarget.value)).slice(0, 50); onFieldInput?.("country"); }} />
      </div>
      <div>
        <Label className="mb-1 block" htmlFor="birthDate">Fecha de Nacimiento</Label>
        <DateInput id="birthDate" name="birthDate" min="1900-01-01" max="2100-12-31" defaultValue={supplier?.birthDate ?? ""} onValueChange={() => onFieldInput?.("birthDate")} />
      </div>
      <div>
        <Label className="mb-1 block" htmlFor="partnerSince">Aliado Desde</Label>
        <DateInput id="partnerSince" name="partnerSince" min="1900-01-01" max="2100-12-31" defaultValue={supplier?.partnerSince ?? ""} onValueChange={() => onFieldInput?.("partnerSince")} />
      </div>
      <div>
        <Label className="mb-1 block" htmlFor="contractEndAt">Fin de Contrato</Label>
        <DateInput id="contractEndAt" name="contractEndAt" min="1900-01-01" max="2100-12-31" defaultValue={supplier?.contractEndAt ?? ""} disabled={isIndefinite} onValueChange={() => onFieldInput?.("contractEndAt")} />
      </div>

      <div className="flex items-center gap-2 pt-6 sm:col-span-2">
        <Checkbox
          id="isIndefinite"
          checked={isIndefinite}
          onCheckedChange={(value) => {
            setIsIndefinite(Boolean(value));
            onFieldInput?.("isIndefinite");
          }}
        />
        <Label htmlFor="isIndefinite" className="text-sm font-normal">Contrato indefinido</Label>
        <input type="hidden" name="isIndefinite" value={isIndefinite ? "on" : ""} />
      </div>

      <div className="sm:col-span-2">
        <Label className="mb-1 block" htmlFor="notes">Notas Internas</Label>
        <Textarea id="notes" name="notes" maxLength={500} defaultValue={supplier?.notes ?? ""} onInput={(e) => { e.currentTarget.value = stripNewLines(e.currentTarget.value).slice(0, 500); onFieldInput?.("notes"); }} />
      </div>
    </div>
  );
}

// Backwards compatible default export: full form
export function SupplierBasicFields(props: Props) {
  return (
    <>
      <SupplierBasicCoreFields {...props} />
      <SupplierBasicExtraFields {...props} />
    </>
  );
}
