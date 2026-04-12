"use client";

import { useState } from "react";

import { ChevronDown, Monitor, Save, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { sessionTtlOptions, themeOptions, timezoneOptions } from "../core";
import type { SystemForm } from "../core";

type Props = {
  system: SystemForm;
  isPending: boolean;
  setSystem: (updater: (prev: SystemForm) => SystemForm) => void;
  onSave: () => void;
};

export function SystemTab({ system, isPending, setSystem, onSave }: Props) {
  // Estado inicial: todos cerrados
  const [openSection, setOpenSection] = useState<
    "appearance" | "regional" | "contingency" | null
  >(null);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleSection = (section: "appearance" | "regional" | "contingency") => {
    setOpenSection(openSection === section ? null : section);
  };

  const updateSystem = (updater: (prev: SystemForm) => SystemForm) => {
    setSystem(updater);
    setHasChanges(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Monitor className="size-4 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Configuración del Sistema</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona la apariencia, preferencias regionales y datos de contingencia
          </p>
        </div>
      </div>

      {/* ACORDEÓN 1: Apariencia */}
      <div className="rounded-xl bg-muted/30 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("appearance")}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors active:bg-muted"
        >
          <h3 className="text-sm font-medium">Apariencia</h3>
          <ChevronDown
            className={`size-4 transition-transform duration-200 ${
              openSection === "appearance" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSection === "appearance" && (
          <div className="px-5 pb-5 pt-1">
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = system.theme === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateSystem((v) => ({ ...v, theme: option.value }))}
                    className={`flex flex-col items-center justify-center rounded-lg bg-background/70 py-4 text-xs transition-all ${
                      isSelected
                        ? "bg-primary/10 ring-1 ring-primary/30"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Icon className={`mb-2 size-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ACORDEÓN 2: Preferencias Regionales */}
      <div className="rounded-xl bg-muted/30 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("regional")}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors active:bg-muted"
        >
          <h3 className="text-sm font-medium">Preferencias Regionales</h3>
          <ChevronDown
            className={`size-4 transition-transform duration-200 ${
              openSection === "regional" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSection === "regional" && (
          <div className="px-5 pb-6 pt-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Idioma</Label>
                <Select 
                  value={system.language} 
                  onValueChange={(v) => updateSystem((s) => ({ ...s, language: v as SystemForm["language"] }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Zona horaria</Label>
                <Select 
                  value={system.timezone} 
                  onValueChange={(v) => updateSystem((s) => ({ ...s, timezone: v ?? "America/La_Paz" }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezoneOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Formato de fecha</Label>
                <Select 
                  value={system.dateFormat} 
                  onValueChange={(v) => updateSystem((s) => ({ ...s, dateFormat: v as SystemForm["dateFormat"] }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Formato de hora</Label>
                <Select 
                  value={system.timeFormat} 
                  onValueChange={(v) => updateSystem((s) => ({ ...s, timeFormat: v as SystemForm["timeFormat"] }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 horas</SelectItem>
                    <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Moneda</Label>
                <Select value={system.currency} disabled>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Sesión expira en</Label>
                <Select 
                  value={String(system.sessionTtlMinutes)} 
                  onValueChange={(v) => updateSystem((s) => ({ ...s, sessionTtlMinutes: Number(v) }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTtlOptions.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACORDEÓN 3: Contingencia y Firma */}
      <div className="rounded-xl bg-muted/30 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("contingency")}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors active:bg-muted"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-amber-500" />
            <h3 className="text-sm font-medium">Contingencia y Firma</h3>
          </div>
          <ChevronDown
            className={`size-4 transition-transform duration-200 ${
              openSection === "contingency" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSection === "contingency" && (
          <div className="px-5 pb-6 pt-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Teléfono alterno</Label>
                <Input
                  value={system.emergencyPhone}
                  onChange={(e) => updateSystem((v) => ({ 
                    ...v, 
                    emergencyPhone: e.target.value.replace(/\D/g, "").slice(0, 8) 
                  }))}
                  className="h-9"
                  placeholder="71234567"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Contacto de emergencia</Label>
                <Input
                  value={system.emergencyContactName}
                  onChange={(e) => updateSystem((v) => ({ ...v, emergencyContactName: e.target.value }))}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Teléfono emergencia</Label>
                <Input
                  value={system.emergencyContactPhone}
                  onChange={(e) => updateSystem((v) => ({ 
                    ...v, 
                    emergencyContactPhone: e.target.value.replace(/\D/g, "").slice(0, 8) 
                  }))}
                  className="h-9"
                  placeholder="71234567"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Nombre en firma</Label>
                <Input
                  value={system.signatureDisplayName}
                  onChange={(e) => updateSystem((v) => ({ ...v, signatureDisplayName: e.target.value }))}
                  className="h-9"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Cargo en firma</Label>
                <Input
                  value={system.signatureTitle}
                  onChange={(e) => updateSystem((v) => ({ ...v, signatureTitle: e.target.value }))}
                  className="h-9"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end pt-4">
        <Button onClick={onSave} disabled={isPending || !hasChanges} size="sm" className="gap-2 min-w-[140px]">
          <Save className="size-4" />
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}
