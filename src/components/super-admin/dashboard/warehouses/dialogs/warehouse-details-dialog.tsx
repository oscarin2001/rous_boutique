import { Eye } from "lucide-react";

import type { WarehouseRow } from "@/actions/super-admin/warehouses/types";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  row: WarehouseRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WarehouseDetailsDialog({ row, open, onOpenChange }: Props) {
  if (!row) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="size-5 text-primary" />
            Detalle de Bodega
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p><strong>Nombre:</strong> {row.name}</p>
          <p><strong>Telefono:</strong> {row.phone || "Sin telefono"}</p>
          <p><strong>Direccion:</strong> {row.address}</p>
          <p><strong>Ciudad:</strong> {row.city}</p>
          <p><strong>Departamento:</strong> {row.department || "Sin dato"}</p>
          <p><strong>Pais:</strong> {row.country}</p>
          <p><strong>Creado por:</strong> {row.createdByName || "No disponible"}</p>
          <p><strong>Creado el:</strong> {row.createdAt ? new Date(row.createdAt).toLocaleDateString("es-BO") : "Sin fecha"}</p>
          <p><strong>Actualizado por:</strong> {row.updatedByName || "No disponible"}</p>
          <p><strong>Actualizado el:</strong> {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString("es-BO") : "Sin fecha"}</p>
          <div><strong>Sucursales:</strong><div className="mt-1 flex flex-wrap gap-1">{row.branches.length ? row.branches.map((b) => <Badge key={b.id} variant="outline">{b.name}</Badge>) : <span className="text-muted-foreground">Sin asignacion</span>}</div></div>
          <div><strong>Encargados:</strong><div className="mt-1 flex flex-wrap gap-1">{row.managers.length ? row.managers.map((m) => <Badge key={m.id} variant="secondary">{m.fullName}</Badge>) : <span className="text-muted-foreground">Sin asignacion</span>}</div></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

