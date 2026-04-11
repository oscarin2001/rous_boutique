"use client";

import { useState } from "react";

import { Bell, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import type { SystemForm } from "../core";

type Props = {
  system: SystemForm;
  isPending: boolean;
  setSystem: (updater: (prev: SystemForm) => SystemForm) => void;
  onSave: () => void;
};

export function NotificationsTab({ system, isPending, setSystem, onSave }: Props) {
  const [hasChanges, setHasChanges] = useState(false);

  const updateGeneral = (checked: boolean) => {
    setSystem((prev) => ({ ...prev, notifications: checked }));
    setHasChanges(true);
  };

  const updateChannel = (key: keyof SystemForm["notificationChannels"], checked: boolean) => {
    setSystem((prev) => ({
      ...prev,
      notificationChannels: {
        ...prev.notificationChannels,
        [key]: checked,
      },
    }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-10">
      {/* Header de sección */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Bell className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Notificaciones</h2>
            <p className="text-sm text-muted-foreground">
              Configura qué alertas recibes como Super Admin
            </p>
          </div>
        </div>
      </div>

      {/* Configuración General */}
      <div className="rounded-2xl bg-muted/30 p-8">
        <h3 className="text-lg font-semibold mb-6">Estado General</h3>
        
        <div className="flex items-center gap-3">
          <Checkbox
            id="notifications"
            checked={system.notifications}
            onCheckedChange={(checked) => updateGeneral(Boolean(checked))}
          />
          <div>
            <Label htmlFor="notifications" className="text-base font-medium cursor-pointer">
              Activar notificaciones del sistema
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Si desactivas esta opción, no recibirás ninguna alerta.
            </p>
          </div>
        </div>
      </div>

      {/* Canales de Notificación */}
      <div className="rounded-2xl bg-muted/30 p-8">
        <h3 className="text-lg font-semibold mb-6">Canales y Eventos</h3>
        
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-4">
              Recibir alertas cuando ocurran:
            </p>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  checked={system.notificationChannels.login}
                  onCheckedChange={(checked) => updateChannel("login", Boolean(checked))}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-medium">Inicio de sesión</span>
                  <p className="text-sm text-muted-foreground">Cuando alguien accede a la cuenta</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  checked={system.notificationChannels.create}
                  onCheckedChange={(checked) => updateChannel("create", Boolean(checked))}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-medium">Creaciones</span>
                  <p className="text-sm text-muted-foreground">Nuevos registros (productos, sucursales, etc.)</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  checked={system.notificationChannels.update}
                  onCheckedChange={(checked) => updateChannel("update", Boolean(checked))}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-medium">Actualizaciones</span>
                  <p className="text-sm text-muted-foreground">Cambios en registros existentes</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  checked={system.notificationChannels.delete}
                  onCheckedChange={(checked) => updateChannel("delete", Boolean(checked))}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-medium">Eliminaciones</span>
                  <p className="text-sm text-muted-foreground">Cuando se elimina un registro</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group sm:col-span-2">
                <Checkbox
                  checked={system.notificationChannels.security}
                  onCheckedChange={(checked) => updateChannel("security", Boolean(checked))}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-medium">Eventos de seguridad</span>
                  <p className="text-sm text-muted-foreground">Sesiones sospechosas, intentos fallidos y alertas de seguridad</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={onSave} 
          disabled={isPending || !hasChanges}
          className="gap-2 min-w-[180px]"
        >
          <Save className="size-4" />
          Guardar preferencias
        </Button>
      </div>
    </div>
  );
}
