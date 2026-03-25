import { Eye } from "lucide-react";

import type { SupplierRow } from "@/actions/super-admin/suppliers/types";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
        <div className="space-y-2 text-sm">
          <p><strong>Nombre:</strong> {supplier.fullName}</p>
          <p><strong>Correo:</strong> {supplier.email || "Sin correo"}</p>
          <p><strong>Telefono:</strong> {supplier.phone || "Sin telefono"}</p>
          <p><strong>CI:</strong> {supplier.ci || "Sin CI"}</p>
          <p><strong>Direccion:</strong> {supplier.address || "Sin direccion"}</p>
          <p><strong>Ciudad:</strong> {supplier.city || "Sin ciudad"}</p>
          <p><strong>Departamento:</strong> {supplier.department || "Sin departamento"}</p>
          <p><strong>Pais:</strong> {supplier.country || "Sin pais"}</p>
          <p><strong>Aliado desde:</strong> {supplier.partnerSince || "Sin fecha"}</p>
          <p><strong>Fin contrato:</strong> {supplier.contractEndAt || "Sin fecha"}</p>
          <p><strong>Contrato indefinido:</strong> {supplier.isIndefinite ? "Si" : "No"}</p>

          <div>
            <strong>Sucursales:</strong>
            <div className="mt-1 flex flex-wrap gap-1">
              {supplier.branches.length
                ? supplier.branches.map((b) => <Badge key={b.id} variant="outline">{b.name}</Badge>)
                : <span className="text-muted-foreground">Sin asignacion</span>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

