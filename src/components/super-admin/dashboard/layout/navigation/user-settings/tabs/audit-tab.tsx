"use client";

import { InfoHint } from "../components";
import type { AuditFeedRow } from "../core";

type Props = {
  auditFeed: AuditFeedRow[];
};

export function AuditTab({ auditFeed }: Props) {
  return (
    <div className="rounded-xl bg-card/80 p-4 shadow-sm ring-1 ring-border/40">
      <div className="mb-3 flex w-full items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-1 text-sm font-semibold">
          Auditoria y actividad
          <InfoHint text="Trazabilidad de cambios administrativos para control y cumplimiento." />
        </div>
      </div>
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
  );
}
