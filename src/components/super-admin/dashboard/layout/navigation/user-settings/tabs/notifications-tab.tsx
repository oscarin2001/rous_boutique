"use client";

import { useState } from "react";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  const [isGeneralOpen, setIsGeneralOpen] = useState(true);
  const [isChannelsOpen, setIsChannelsOpen] = useState(true);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-card/80 p-4 shadow-sm ring-1 ring-border/40">
        <div className="flex items-center gap-1 text-sm font-semibold">
          Centro de notificaciones
          <InfoHint text="Controla que eventos generan alertas para tu cuenta superadmin." />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Seccionado por estado general y canales de aviso.</p>
      </div>

      <Collapsible open={isGeneralOpen} onOpenChange={setIsGeneralOpen} className="rounded-xl bg-card/80 shadow-sm ring-1 ring-border/40">
        <CollapsibleTrigger render={<div />} nativeButton={false} className="flex w-full items-center justify-between gap-3 p-4 text-left">
          <p className="text-sm font-semibold">Estado general</p>
          <ChevronDownIcon className={`size-4 text-muted-foreground transition-transform ${isGeneralOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t p-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="notifications"
              checked={system.notifications}
              onCheckedChange={(checked) => setSystem((v) => ({ ...v, notifications: Boolean(checked) }))}
            />
            <Label htmlFor="notifications" className="font-normal">Activar notificaciones generales</Label>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={isChannelsOpen} onOpenChange={setIsChannelsOpen} className="rounded-xl bg-card/80 shadow-sm ring-1 ring-border/40">
        <CollapsibleTrigger render={<div />} nativeButton={false} className="flex w-full items-center justify-between gap-3 p-4 text-left">
          <p className="text-sm font-semibold">Canales de aviso</p>
          <ChevronDownIcon className={`size-4 text-muted-foreground transition-transform ${isChannelsOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t p-4">
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
        </CollapsibleContent>
      </Collapsible>

      <div className="flex justify-end">
        <Button type="button" onClick={onSave} disabled={isPending}>Guardar notificaciones</Button>
      </div>
    </div>
  );
}
