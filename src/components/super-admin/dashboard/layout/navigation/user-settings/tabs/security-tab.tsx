"use client";

import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

import { InfoHint } from "../components";
import type { AuditFeedRow, CreateAccountFieldErrors, CreateSuperAdminForm, SessionRow } from "../core";

type Props = {
  form: CreateSuperAdminForm;
  errors: CreateAccountFieldErrors;
  sessions: SessionRow[];
  auditFeed: AuditFeedRow[];
  isPending: boolean;
  isEditMode: boolean;
  setForm: (updater: (prev: CreateSuperAdminForm) => CreateSuperAdminForm) => void;
  setErrors: (updater: (prev: CreateAccountFieldErrors) => CreateAccountFieldErrors) => void;
  onCreate: () => void;
  onRevokeOther: () => void;
};

export function SecurityTab({ form, errors, sessions, auditFeed, isPending, isEditMode, setForm, setErrors, onCreate, onRevokeOther }: Props) {
  const clear = (key: keyof CreateAccountFieldErrors) => setErrors((v) => ({ ...v, [key]: undefined }));

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-card/80 p-4 shadow-sm ring-1 ring-border/40">
        <div className="mb-3 flex items-center justify-between"><h4 className="flex items-center gap-1 text-sm font-semibold">Crear otra cuenta SUPERADMIN <InfoHint text="Permite alta directa de otro superadmin con validacion de mayoria de edad y credenciales fuertes." /></h4><Button type="button" onClick={onCreate} disabled={isPending || !isEditMode}>Crear cuenta</Button></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <p className="sm:col-span-2 text-xs text-muted-foreground">Al crear la cuenta se abrira un modal de confirmacion con contrasena actual del superadmin.</p>
          <div><Label>Nombre</Label><Input disabled={!isEditMode} value={form.firstName} onChange={(e) => { setForm((v) => ({ ...v, firstName: e.target.value })); clear("firstName"); }} />{errors.firstName ? <p className="mt-1 text-xs text-destructive">{errors.firstName}</p> : null}</div>
          <div><Label>Apellido</Label><Input disabled={!isEditMode} value={form.lastName} onChange={(e) => { setForm((v) => ({ ...v, lastName: e.target.value })); clear("lastName"); }} />{errors.lastName ? <p className="mt-1 text-xs text-destructive">{errors.lastName}</p> : null}</div>
          <div><Label>Fecha de nacimiento</Label><DateInput disabled={!isEditMode} max={new Date().toISOString().slice(0, 10)} value={form.birthDate} onValueChange={(v) => { setForm((f) => ({ ...f, birthDate: v })); clear("birthDate"); }} />{errors.birthDate ? <p className="mt-1 text-xs text-destructive">{errors.birthDate}</p> : null}</div>
          <div><Label>CI</Label><Input disabled={!isEditMode} value={form.ci} onChange={(e) => { setForm((v) => ({ ...v, ci: e.target.value.slice(0, 20) })); clear("ci"); }} />{errors.ci ? <p className="mt-1 text-xs text-destructive">{errors.ci}</p> : null}</div>
          <div><Label>Telefono</Label><Input disabled={!isEditMode} value={form.phone} onChange={(e) => { setForm((v) => ({ ...v, phone: e.target.value.replace(/\D/g, "").slice(0, 8) })); clear("phone"); }} />{errors.phone ? <p className="mt-1 text-xs text-destructive">{errors.phone}</p> : null}</div>
          <div><Label>Usuario</Label><Input disabled={!isEditMode} value={form.username} onChange={(e) => { setForm((v) => ({ ...v, username: e.target.value.toLowerCase() })); clear("username"); }} />{errors.username ? <p className="mt-1 text-xs text-destructive">{errors.username}</p> : null}</div>
          <div><Label>Contrasena</Label><PasswordInput disabled={!isEditMode} value={form.password} onChange={(e) => { setForm((v) => ({ ...v, password: e.target.value })); clear("password"); }} />{errors.password ? <p className="mt-1 text-xs text-destructive">{errors.password}</p> : null}</div>
          <div><Label>Confirmar contrasena</Label><PasswordInput disabled={!isEditMode} value={form.passwordConfirm} onChange={(e) => { setForm((v) => ({ ...v, passwordConfirm: e.target.value })); clear("passwordConfirm"); }} />{errors.passwordConfirm ? <p className="mt-1 text-xs text-destructive">{errors.passwordConfirm}</p> : null}</div>
        </div>
      </div>

      <div className="rounded-xl bg-card/80 p-4 shadow-sm ring-1 ring-border/40">
        <div className="mb-3 flex items-center justify-between"><h4 className="flex items-center gap-1 text-sm font-semibold">Sesiones activas y recientes <InfoHint text="Muestra historial de dispositivos y permite cerrar sesiones en otros equipos." /></h4><Button type="button" variant="outline" onClick={onRevokeOther} disabled={isPending || !isEditMode}>Cerrar otras sesiones</Button></div>
        <p className="mb-2 text-xs text-muted-foreground">Al cerrar sesiones tambien se pedira confirmacion en modal.</p>
        <div className="space-y-2">
          {sessions.map((item) => (
            <div key={item.sessionId} className="rounded-md border p-2 text-xs">
              <p className="font-medium">{item.isCurrent ? "Sesion actual" : "Sesion registrada"} - {item.browser ?? "Navegador"} / {item.os ?? "SO"}</p>
              <p className="text-muted-foreground">IP: {item.ipAddress ?? "Sin IP"} - Ultima actividad: {new Date(item.lastSeenAt).toLocaleString("es-BO")}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-card/80 p-4 shadow-sm ring-1 ring-border/40">
        <div className="mb-3 flex items-center gap-1"><h4 className="text-sm font-semibold">Auditoria reciente</h4><InfoHint text="Muestra quien cambio configuraciones y cuando, para trazabilidad enterprise." /></div>
        <div className="space-y-2">
          {auditFeed.length ? auditFeed.map((item) => (
            <div key={item.id} className="rounded-md border p-2 text-xs">
              <p className="font-medium">{item.title}</p>
              <p className="text-muted-foreground">{item.description}</p>
              <p className="text-muted-foreground">{new Date(item.createdAt).toLocaleString("es-BO")} - {item.actorName}</p>
            </div>
          )) : <p className="text-xs text-muted-foreground">No hay eventos recientes.</p>}
        </div>
      </div>
    </div>
  );
}
