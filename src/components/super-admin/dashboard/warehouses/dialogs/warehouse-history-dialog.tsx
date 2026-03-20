import { History } from "lucide-react";

import type { WarehouseHistoryRow } from "@/actions/super-admin/warehouses/types";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  rows: WarehouseHistoryRow[];
}

export function WarehouseHistoryDialog({ open, onOpenChange, loading, rows }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            Historial de Bodega
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-96 space-y-2 overflow-y-auto text-sm">
          {loading ? <p className="text-muted-foreground">Cargando...</p> : null}
          {!loading && rows.length === 0 ? <p className="text-muted-foreground">Sin movimientos registrados.</p> : null}
          {rows.map((row) => (
            <div key={row.id} className="rounded-lg bg-muted/30 p-2">
              <p><strong>{row.action}</strong> por {row.actorName}</p>
              <p className="text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

