"use client";

import { History } from "lucide-react";

import type { BranchAuditEntry } from "@/actions/super-admin/branches/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: BranchAuditEntry[];
  isLoading: boolean;
}

function fmt(date: string) {
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function BranchHistoryDialog({
  open,
  onOpenChange,
  entries,
  isLoading,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            Historial de la sucursal
          </DialogTitle>
        </DialogHeader>

        {isLoading ? <p className="text-sm text-muted-foreground">Cargando historial...</p> : null}

        {!isLoading && entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay registros de auditoría.</p>
        ) : null}

        {!isLoading && entries.length > 0 ? (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {entries.map((entry) => (
              <article key={entry.id} className="rounded-lg bg-muted/30 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{entry.action}</span>
                  <span className="text-muted-foreground">{fmt(entry.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.employeeName ? `Por ${entry.employeeName}` : "Sistema"}
                </p>
                {entry.newValue ? (
                  <pre className="mt-2 overflow-x-auto rounded bg-muted/40 p-2 text-xs">{entry.newValue}</pre>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

