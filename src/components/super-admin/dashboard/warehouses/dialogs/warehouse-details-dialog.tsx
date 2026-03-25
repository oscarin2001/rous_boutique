import { Eye } from "lucide-react";

import type { WarehouseRow } from "@/actions/super-admin/warehouses/types";


import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface Props {
  row: WarehouseRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WarehouseDetailsDialog({ row, open, onOpenChange }: Props) {
  if (!row) return null;

  function fmtDate(date: string | null) {
    if (!date) return "-";
    return new Intl.DateTimeFormat("es-BO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="size-5 text-primary" />
            Detalle de Bodega
          </DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campo</TableHead>
              <TableHead>Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { label: "Nombre", value: row.name },
              { label: "Telefono", value: row.phone || "Sin telefono" },
              { label: "Direccion", value: row.address },
              { label: "Ciudad", value: row.city },
              { label: "Departamento", value: row.department || "Sin dato" },
              { label: "Pais", value: row.country },
              { label: "Creado por", value: row.createdByName || "No disponible" },
              { label: "Creado el", value: fmtDate(row.createdAt) },
              { label: "Actualizado por", value: row.updatedByName || "No disponible" },
              { label: "Actualizado el", value: fmtDate(row.updatedAt) },
              { label: "Sucursales", value: row.branches.length
                ? <div className="flex flex-wrap gap-1">{row.branches.map((b) => <Badge key={b.id} variant="outline">{b.name}</Badge>)}</div>
                : <span className="text-muted-foreground">Sin asignacion</span> },
              { label: "Encargados", value: row.managers.length
                ? <div className="flex flex-wrap gap-1">{row.managers.map((m) => <Badge key={m.id} variant="secondary">{m.fullName}</Badge>)}</div>
                : <span className="text-muted-foreground">Sin asignacion</span> },
            ]
              .sort((a, b) => a.label.localeCompare(b.label, "es"))
              .map((row) => (
                <TableRow key={row.label}>
                  <TableCell className="font-medium text-sm text-muted-foreground">{row.label}</TableCell>
                  <TableCell className="text-sm">{row.value}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}

