import { Eye } from "lucide-react";

import type { SupplierRow } from "@/actions/super-admin/suppliers/types";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface Props {
  supplier: SupplierRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupplierDetailsDialog({ supplier, open, onOpenChange }: Props) {
  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="size-5 text-primary" />
            Detalle de Proveedor
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
              { label: "Nombre", value: supplier.fullName },
              { label: "Correo", value: supplier.email || "Sin correo" },
              { label: "Telefono", value: supplier.phone || "Sin telefono" },
              { label: "CI", value: supplier.ci || "Sin CI" },
              { label: "Direccion", value: supplier.address || "Sin direccion" },
              { label: "Ciudad", value: supplier.city || "Sin ciudad" },
              { label: "Departamento", value: supplier.department || "Sin departamento" },
              { label: "Pais", value: supplier.country || "Sin pais" },
              { label: "Aliado desde", value: supplier.partnerSince || "Sin fecha" },
              { label: "Fin contrato", value: supplier.contractEndAt || "Sin fecha" },
              { label: "Contrato indefinido", value: supplier.isIndefinite ? "Si" : "No" },
              { label: "Sucursales", value: supplier.branches.length
                ? supplier.branches.map((b) => b.name).join(", ")
                : "Sin asignacion" },
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

