"use client";

import { useState } from "react";

import { ChevronDown, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import type { SessionRow } from "../core";

type Props = {
  sessions: SessionRow[];
  isPending: boolean;
  onRevokeOther: () => void;
};

export function AccountSecurityTab({ sessions, isPending, onRevokeOther }: Props) {
  // Estado para controlar qué sección está abierta (solo una a la vez)
  const [openSection, setOpenSection] = useState<"actions" | "sessions" | null>(null);

  const toggleSection = (section: "actions" | "sessions") => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="space-y-4">
      {/* Header principal */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <Shield className="size-5 text-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Seguridad de la Cuenta</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona sesiones activas y acciones de seguridad
          </p>
        </div>
      </div>

      {/* Acciones de Seguridad */}
      <Collapsible
        open={openSection === "actions"}
        onOpenChange={() => toggleSection("actions")}
        className="rounded-xl bg-muted/30"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors">
          <h3 className="font-medium">Acciones de seguridad</h3>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform duration-200 ${
              openSection === "actions" ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>

        <CollapsibleContent className="px-5 pb-6">
          <div className="space-y-4 pt-1">
            <p className="text-sm text-muted-foreground">
              Se pedirá confirmación con tu contraseña para cerrar sesiones en otros dispositivos.
            </p>

            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onRevokeOther} 
                disabled={isPending}
              >
                Cerrar todas las demás sesiones
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Sesiones Registradas */}
      <Collapsible
        open={openSection === "sessions"}
        onOpenChange={() => toggleSection("sessions")}
        className="rounded-xl bg-muted/30"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors">
          <h3 className="font-medium">Sesiones registradas</h3>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform duration-200 ${
              openSection === "sessions" ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>

        <CollapsibleContent className="px-5 pb-6">
          <div className="space-y-3 pt-1">
            {sessions.length > 0 ? (
              sessions.map((item) => (
                <div 
                  key={item.sessionId} 
                  className="rounded-lg bg-background/70 p-4 text-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {item.isCurrent ? "Sesión actual" : "Sesión registrada"}
                      </p>
                      <p className="text-muted-foreground mt-1">
                        {item.browser ?? "Navegador desconocido"} • {item.os ?? "Sistema operativo"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-y-1">
                    <p>IP: <span className="font-mono">{item.ipAddress ?? "Sin información"}</span></p>
                    <p>
                      Última actividad:{" "}
                      {new Date(item.lastSeenAt).toLocaleString("es-BO", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg bg-background/70 p-8 text-center">
                <p className="text-muted-foreground">No hay sesiones registradas recientemente.</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
