"use client";

import { useState } from "react";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { InfoHint } from "../components";
import type { SessionRow } from "../core";

type Props = {
  sessions: SessionRow[];
  isPending: boolean;
  onRevokeOther: () => void;
};

export function AccountSecurityTab({ sessions, isPending, onRevokeOther }: Props) {
  const [isActionsOpen, setIsActionsOpen] = useState(true);
  const [isSessionsOpen, setIsSessionsOpen] = useState(true);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-card/80 p-4 shadow-sm ring-1 ring-border/40">
        <div className="flex items-center gap-1 text-sm font-semibold">
          Seguridad de cuenta
          <InfoHint text="Sesiones activas, dispositivos recientes y cierre remoto de sesiones." />
        </div>
      </div>

      <Collapsible open={isActionsOpen} onOpenChange={setIsActionsOpen} className="rounded-xl bg-card/80 shadow-sm ring-1 ring-border/40">
        <CollapsibleTrigger render={<div />} nativeButton={false} className="flex w-full items-center justify-between gap-3 p-4 text-left">
          <p className="text-sm font-semibold">Acciones de seguridad</p>
          <ChevronDownIcon className={`size-4 text-muted-foreground transition-transform ${isActionsOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 border-t p-4">
          <p className="text-xs text-muted-foreground">Se pedira confirmacion con contrasena para cerrar sesiones en otros dispositivos.</p>
          <div className="flex items-center justify-end">
            <Button type="button" variant="outline" onClick={onRevokeOther} disabled={isPending}>
              Cerrar otras sesiones
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={isSessionsOpen} onOpenChange={setIsSessionsOpen} className="rounded-xl bg-card/80 shadow-sm ring-1 ring-border/40">
        <CollapsibleTrigger render={<div />} nativeButton={false} className="flex w-full items-center justify-between gap-3 p-4 text-left">
          <p className="text-sm font-semibold">Sesiones registradas</p>
          <ChevronDownIcon className={`size-4 text-muted-foreground transition-transform ${isSessionsOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 border-t p-4">
          {sessions.map((item) => (
            <div key={item.sessionId} className="rounded-md border p-2 text-xs">
              <p className="font-medium">{item.isCurrent ? "Sesion actual" : "Sesion registrada"} - {item.browser ?? "Navegador"} / {item.os ?? "SO"}</p>
              <p className="text-muted-foreground">IP: {item.ipAddress ?? "Sin IP"} - Ultima actividad: {new Date(item.lastSeenAt).toLocaleString("es-BO")}</p>
            </div>
          ))}
          {!sessions.length ? <p className="text-xs text-muted-foreground">No hay sesiones recientes.</p> : null}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
