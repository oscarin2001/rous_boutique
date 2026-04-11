"use client";

import type { SuperAdminAuditEntry, SuperAdminRow } from "@/actions/super-admin/superadmins/types";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  superAdmin: SuperAdminRow | null;
  entries: SuperAdminAuditEntry[];
};

function prettyJson(value: string | null) {
  if (!value) return "-";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export function SuperAdminHistoryDialog({
  open,
  onOpenChange,
  superAdmin,
  entries,
}: Props) {
  if (!superAdmin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle>Historial de cambios</DialogTitle>
          <DialogDescription>{superAdmin.fullName}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {entries.length ? (
            entries.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-semibold">
                  {entry.entity} • {entry.action}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleString("es-BO")} • {entry.employeeName ?? "Sistema"}
                </p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-2 text-[11px]">{prettyJson(entry.oldValue)}</pre>
                  <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-2 text-[11px]">{prettyJson(entry.newValue)}</pre>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No hay historial disponible.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
