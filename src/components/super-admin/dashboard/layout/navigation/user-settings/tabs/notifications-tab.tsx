"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { InfoHint } from "../components";
import type { SystemForm } from "../core";

type Props = {
  system: SystemForm;
  isPending: boolean;
  setSystem: (updater: (prev: SystemForm) => SystemForm) => void;
  onSave: () => void;
};

export function NotificationsTab({ system, isPending, setSystem, onSave }: Props) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-card/80 p-4 shadow-sm ring-1 ring-border/40">
        <div className="mb-3 flex items-center gap-1 text-sm font-semibold">
          Centro de notificaciones
          <InfoHint text="Controla que eventos generan alertas para tu cuenta superadmin." />
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Esta seccion gestiona solo alertas y avisos. La configuracion general del sistema esta separada para mantener un flujo profesional por bloques.
        </p>
        <div className="space-y-3 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="notifications"
              checked={system.notifications}
              onCheckedChange={(checked) => setSystem((v) => ({ ...v, notifications: Boolean(checked) }))}
            />
            <Label htmlFor="notifications" className="font-normal">Activar notificaciones generales</Label>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            <label className="flex items-center gap-2">
              <Checkbox checked={system.notificationChannels.login} onCheckedChange={(checked) => setSystem((v) => ({ ...v, notificationChannels: { ...v.notificationChannels, login: Boolean(checked) } }))} />
              Avisar cuando alguien ingresa
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={system.notificationChannels.create} onCheckedChange={(checked) => setSystem((v) => ({ ...v, notificationChannels: { ...v.notificationChannels, create: Boolean(checked) } }))} />
              Avisar en creaciones
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={system.notificationChannels.update} onCheckedChange={(checked) => setSystem((v) => ({ ...v, notificationChannels: { ...v.notificationChannels, update: Boolean(checked) } }))} />
              Avisar en actualizaciones
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={system.notificationChannels.delete} onCheckedChange={(checked) => setSystem((v) => ({ ...v, notificationChannels: { ...v.notificationChannels, delete: Boolean(checked) } }))} />
              Avisar en eliminaciones
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
              <Checkbox checked={system.notificationChannels.security} onCheckedChange={(checked) => setSystem((v) => ({ ...v, notificationChannels: { ...v.notificationChannels, security: Boolean(checked) } }))} />
              Avisar eventos de seguridad y sesiones
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={onSave} disabled={isPending}>Guardar notificaciones</Button>
      </div>
    </div>
  );
}
