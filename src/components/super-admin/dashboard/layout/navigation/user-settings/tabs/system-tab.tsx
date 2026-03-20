"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { InfoHint } from "../components";
import { sessionTtlOptions, themeOptions, timezoneOptions } from "../core";
import type { SystemForm } from "../core";

type Props = {
  system: SystemForm;
  isPending: boolean;
  isEditMode: boolean;
  setSystem: (updater: (prev: SystemForm) => SystemForm) => void;
  onSave: () => void;
};

export function SystemTab({ system, isPending, isEditMode, setSystem, onSave }: Props) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-card/80 p-4 shadow-sm ring-1 ring-border/40">
        <div className="flex items-center gap-1"><Label>Tema visual</Label><InfoHint text="Define apariencia del panel. Sistema usa el tema del dispositivo." /></div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const selected = system.theme === option.value;
            return (
              <button type="button" key={option.value} disabled={!isEditMode} className={`rounded-md border p-3 text-sm ${selected ? "border-primary bg-primary/5" : "hover:border-primary/40"}`} onClick={() => setSystem((v) => ({ ...v, theme: option.value }))}>
                <Icon className="mx-auto mb-1 size-4" />{option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl bg-card/80 p-4 shadow-sm ring-1 ring-border/40 sm:grid-cols-2">
        <div><div className="flex items-center gap-1"><Label>Idioma</Label><InfoHint text="Idioma de interfaz para este superadmin." /></div><Select value={system.language} disabled={!isEditMode} onValueChange={(v) => setSystem((s) => ({ ...s, language: v as SystemForm["language"] }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="es">Espanol</SelectItem><SelectItem value="en">English</SelectItem><SelectItem value="pt">Portugues</SelectItem><SelectItem value="fr">Francais</SelectItem></SelectContent></Select></div>
        <div><div className="flex items-center gap-1"><Label>Zona horaria</Label><InfoHint text="Se usa para mostrar fechas y horas operativas." /></div><Select value={system.timezone} disabled={!isEditMode} onValueChange={(v) => setSystem((s) => ({ ...s, timezone: v ?? "America/La_Paz" }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{timezoneOptions.map((it) => <SelectItem key={it.value} value={it.value}>{it.label}</SelectItem>)}</SelectContent></Select></div>
        <div><div className="flex items-center gap-1"><Label>Formato de fecha</Label><InfoHint text="Formato regional para fecha en vistas y reportes." /></div><Select value={system.dateFormat} disabled={!isEditMode} onValueChange={(v) => setSystem((s) => ({ ...s, dateFormat: v as SystemForm["dateFormat"] }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem><SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem><SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem></SelectContent></Select></div>
        <div><div className="flex items-center gap-1"><Label>Formato de hora</Label><InfoHint text="Define visualizacion en 12h o 24h." /></div><Select value={system.timeFormat} disabled={!isEditMode} onValueChange={(v) => setSystem((s) => ({ ...s, timeFormat: v as SystemForm["timeFormat"] }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="24h">24 horas</SelectItem><SelectItem value="12h">12 horas</SelectItem></SelectContent></Select></div>
        <div><div className="flex items-center gap-1"><Label>Moneda</Label><InfoHint text="Bloqueada temporalmente por politica financiera. Se mantiene por defecto." /></div><Select value={system.currency} disabled onValueChange={(v) => setSystem((s) => ({ ...s, currency: v as SystemForm["currency"] }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="BOB">BOB</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent></Select><p className="mt-1 text-xs text-muted-foreground">Cambio de moneda deshabilitado temporalmente.</p></div>
        <div><div className="flex items-center gap-1"><Label>Expiracion de sesion</Label><InfoHint text="Tiempo maximo de sesion para nuevos inicios de sesion." /></div><Select value={String(system.sessionTtlMinutes)} disabled={!isEditMode} onValueChange={(v) => setSystem((s) => ({ ...s, sessionTtlMinutes: Number(v) }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{sessionTtlOptions.map((it) => <SelectItem key={it.value} value={String(it.value)}>{it.label}</SelectItem>)}</SelectContent></Select></div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl bg-card/80 p-4 shadow-sm ring-1 ring-border/40 sm:grid-cols-2">
        <p className="sm:col-span-2 flex items-center gap-1 text-xs text-muted-foreground">Datos de contingencia y firma operativa. <InfoHint text="Se usan para contacto de emergencia y encabezados de documentos internos." /></p>
        <div><Label>Telefono alterno</Label><Input disabled={!isEditMode} value={system.emergencyPhone} onChange={(e) => setSystem((v) => ({ ...v, emergencyPhone: e.target.value.replace(/\D/g, "").slice(0, 8) }))} /></div>
        <div><Label>Contacto de emergencia</Label><Input disabled={!isEditMode} value={system.emergencyContactName} onChange={(e) => setSystem((v) => ({ ...v, emergencyContactName: e.target.value }))} /></div>
        <div><Label>Telefono contacto</Label><Input disabled={!isEditMode} value={system.emergencyContactPhone} onChange={(e) => setSystem((v) => ({ ...v, emergencyContactPhone: e.target.value.replace(/\D/g, "").slice(0, 8) }))} /></div>
        <div><Label>Nombre visible firma</Label><Input disabled={!isEditMode} value={system.signatureDisplayName} onChange={(e) => setSystem((v) => ({ ...v, signatureDisplayName: e.target.value }))} /></div>
        <div className="sm:col-span-2"><Label>Cargo en firma</Label><Input disabled={!isEditMode} value={system.signatureTitle} onChange={(e) => setSystem((v) => ({ ...v, signatureTitle: e.target.value }))} /></div>
      </div>

      <div className="space-y-3 rounded-xl bg-card/80 p-3 shadow-sm ring-1 ring-border/40">
        <div className="flex items-center gap-2"><Checkbox id="notifications" disabled={!isEditMode} checked={system.notifications} onCheckedChange={(checked) => setSystem((v) => ({ ...v, notifications: Boolean(checked) }))} /><Label htmlFor="notifications" className="font-normal">Notificaciones generales activas</Label></div>
        <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
          <label className="flex items-center gap-2"><Checkbox checked={system.notificationChannels.login} disabled={!isEditMode} onCheckedChange={(checked) => setSystem((v) => ({ ...v, notificationChannels: { ...v.notificationChannels, login: Boolean(checked) } }))} />Avisar cuando alguien ingresa</label>
          <label className="flex items-center gap-2"><Checkbox checked={system.notificationChannels.create} disabled={!isEditMode} onCheckedChange={(checked) => setSystem((v) => ({ ...v, notificationChannels: { ...v.notificationChannels, create: Boolean(checked) } }))} />Avisar en creaciones</label>
          <label className="flex items-center gap-2"><Checkbox checked={system.notificationChannels.update} disabled={!isEditMode} onCheckedChange={(checked) => setSystem((v) => ({ ...v, notificationChannels: { ...v.notificationChannels, update: Boolean(checked) } }))} />Avisar en actualizaciones</label>
          <label className="flex items-center gap-2"><Checkbox checked={system.notificationChannels.delete} disabled={!isEditMode} onCheckedChange={(checked) => setSystem((v) => ({ ...v, notificationChannels: { ...v.notificationChannels, delete: Boolean(checked) } }))} />Avisar en eliminaciones</label>
          <label className="flex items-center gap-2 sm:col-span-2"><Checkbox checked={system.notificationChannels.security} disabled={!isEditMode} onCheckedChange={(checked) => setSystem((v) => ({ ...v, notificationChannels: { ...v.notificationChannels, security: Boolean(checked) } }))} />Avisar eventos de seguridad y sesiones</label>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Al guardar, se abrira un modal para confirmar con contrasena actual.</p>
      <Button type="button" onClick={onSave} disabled={isPending || !isEditMode}>Guardar sistema</Button>
    </div>
  );
}
