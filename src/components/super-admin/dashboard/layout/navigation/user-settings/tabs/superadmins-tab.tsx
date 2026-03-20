"use client";

import { useState } from "react";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

import { InfoHint } from "../components";
import type { CreateAccountFieldErrors, CreateSuperAdminForm } from "../core";

type Props = {
  form: CreateSuperAdminForm;
  errors: CreateAccountFieldErrors;
  isPending: boolean;
  setForm: (updater: (prev: CreateSuperAdminForm) => CreateSuperAdminForm) => void;
  setErrors: (updater: (prev: CreateAccountFieldErrors) => CreateAccountFieldErrors) => void;
  onCreate: () => void;
};

export function SuperadminsTab({ form, errors, isPending, setForm, setErrors, onCreate }: Props) {
  const clear = (key: keyof CreateAccountFieldErrors) => setErrors((v) => ({ ...v, [key]: undefined }));
  const [isPersonalDataOpen, setIsPersonalDataOpen] = useState(true);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(true);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-card/80 p-4 shadow-sm ring-1 ring-border/40">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-sm font-semibold">
            Administracion de superadmins
            <InfoHint text="Crea nuevas cuentas superadmin bajo confirmacion segura." />
          </div>
          <Button type="button" onClick={onCreate} disabled={isPending}>Crear cuenta</Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Esta seccion administra cuentas con nivel superadmin. El alta requiere confirmacion con contrasena actual.</p>
      </div>

      <Collapsible open={isPersonalDataOpen} onOpenChange={setIsPersonalDataOpen} className="rounded-xl bg-card/80 shadow-sm ring-1 ring-border/40">
        <CollapsibleTrigger render={<div />} nativeButton={false} className="flex w-full items-center justify-between gap-3 p-4 text-left">
          <p className="text-sm font-semibold">Datos personales</p>
          <ChevronDownIcon className={`size-4 text-muted-foreground transition-transform ${isPersonalDataOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="grid grid-cols-1 gap-3 border-t p-4 sm:grid-cols-2">
          <div><Label>Nombre</Label><Input value={form.firstName} onChange={(e) => { setForm((v) => ({ ...v, firstName: e.target.value })); clear("firstName"); }} />{errors.firstName ? <p className="mt-1 text-xs text-destructive">{errors.firstName}</p> : null}</div>
          <div><Label>Apellido</Label><Input value={form.lastName} onChange={(e) => { setForm((v) => ({ ...v, lastName: e.target.value })); clear("lastName"); }} />{errors.lastName ? <p className="mt-1 text-xs text-destructive">{errors.lastName}</p> : null}</div>
          <div><Label>Fecha de nacimiento</Label><DateInput max={new Date().toISOString().slice(0, 10)} value={form.birthDate} onValueChange={(v) => { setForm((f) => ({ ...f, birthDate: v })); clear("birthDate"); }} />{errors.birthDate ? <p className="mt-1 text-xs text-destructive">{errors.birthDate}</p> : null}</div>
          <div><Label>CI</Label><Input value={form.ci} onChange={(e) => { setForm((v) => ({ ...v, ci: e.target.value.slice(0, 20) })); clear("ci"); }} />{errors.ci ? <p className="mt-1 text-xs text-destructive">{errors.ci}</p> : null}</div>
          <div><Label>Telefono</Label><Input value={form.phone} onChange={(e) => { setForm((v) => ({ ...v, phone: e.target.value.replace(/\D/g, "").slice(0, 8) })); clear("phone"); }} />{errors.phone ? <p className="mt-1 text-xs text-destructive">{errors.phone}</p> : null}</div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={isCredentialsOpen} onOpenChange={setIsCredentialsOpen} className="rounded-xl bg-card/80 shadow-sm ring-1 ring-border/40">
        <CollapsibleTrigger render={<div />} nativeButton={false} className="flex w-full items-center justify-between gap-3 p-4 text-left">
          <p className="text-sm font-semibold">Credenciales de acceso</p>
          <ChevronDownIcon className={`size-4 text-muted-foreground transition-transform ${isCredentialsOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="grid grid-cols-1 gap-3 border-t p-4 sm:grid-cols-2">
          <div><Label>Usuario</Label><Input value={form.username} onChange={(e) => { setForm((v) => ({ ...v, username: e.target.value.toLowerCase() })); clear("username"); }} />{errors.username ? <p className="mt-1 text-xs text-destructive">{errors.username}</p> : null}</div>
          <div><Label>Contrasena</Label><PasswordInput value={form.password} onChange={(e) => { setForm((v) => ({ ...v, password: e.target.value })); clear("password"); }} />{errors.password ? <p className="mt-1 text-xs text-destructive">{errors.password}</p> : null}</div>
          <div><Label>Confirmar contrasena</Label><PasswordInput value={form.passwordConfirm} onChange={(e) => { setForm((v) => ({ ...v, passwordConfirm: e.target.value })); clear("passwordConfirm"); }} />{errors.passwordConfirm ? <p className="mt-1 text-xs text-destructive">{errors.passwordConfirm}</p> : null}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
