"use client";

import { Button } from "@/components/ui/button";

import { InfoHint } from "../components";
import type { SessionRow } from "../core";

type Props = {
  sessions: SessionRow[];
  isPending: boolean;
  onRevokeOther: () => void;
};

export function AccountSecurityTab({ sessions, isPending, onRevokeOther }: Props) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-card/80 p-4 shadow-sm ring-1 ring-border/40">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-1 text-sm font-semibold">
            Seguridad de cuenta
            <InfoHint text="Sesiones activas, dispositivos recientes y cierre remoto de sesiones." />
          </h3>
          <Button type="button" variant="outline" onClick={onRevokeOther} disabled={isPending}>
            Cerrar otras sesiones
          </Button>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">Se pedira confirmacion con contrasena para cerrar sesiones en otros dispositivos.</p>
        <div className="space-y-2">
          {sessions.map((item) => (
            <div key={item.sessionId} className="rounded-md border p-2 text-xs">
              <p className="font-medium">{item.isCurrent ? "Sesion actual" : "Sesion registrada"} - {item.browser ?? "Navegador"} / {item.os ?? "SO"}</p>
              <p className="text-muted-foreground">IP: {item.ipAddress ?? "Sin IP"} - Ultima actividad: {new Date(item.lastSeenAt).toLocaleString("es-BO")}</p>
            </div>
          ))}
          {!sessions.length ? <p className="text-xs text-muted-foreground">No hay sesiones recientes.</p> : null}
        </div>
      </div>
    </div>
  );
}
