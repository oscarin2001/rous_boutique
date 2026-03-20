import { History } from "lucide-react";

import type { SupplierHistoryRow } from "@/actions/super-admin/suppliers/types";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: SupplierHistoryRow[];
  loading: boolean;
}

export function SupplierHistoryDialog({ open, onOpenChange, rows, loading }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            Historial de Proveedor
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-96 space-y-2 overflow-y-auto text-sm">
          {loading ? <p className="text-muted-foreground">Cargando historial...</p> : null}
          {!loading && rows.length === 0 ? <p className="text-muted-foreground">Sin registros.</p> : null}
          {rows.map((row) => (
            <div key={row.id} className="rounded-lg bg-muted/30 p-2">
              <p><strong>{row.action}</strong> por {row.employeeName || "Sistema"}</p>
              <p className="text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

