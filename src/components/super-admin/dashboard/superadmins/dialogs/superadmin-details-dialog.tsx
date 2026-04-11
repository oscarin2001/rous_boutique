"use client";

import type { SuperAdminRow } from "@/actions/super-admin/superadmins/types";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  superAdmin: SuperAdminRow | null;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "-"}</span>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function SuperAdminDetailsDialog({ open, onOpenChange, superAdmin }: Props) {
  if (!superAdmin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal">
        <DialogHeader>
          <DialogTitle>Detalle del super admin</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Row label="Nombre" value={superAdmin.fullName} />
          <Row label="Usuario" value={`@${superAdmin.username}`} />
          <Row label="CI" value={superAdmin.ci} />
          <Row label="Telefono" value={superAdmin.phone || "-"} />
          <Row label="Nacimiento" value={superAdmin.birthDate || "-"} />
          <div className="grid grid-cols-[140px_1fr] gap-3 text-sm">
            <span className="text-muted-foreground">Estado</span>
            <span><Badge variant="outline">{superAdmin.status}</Badge></span>
          </div>
          <Row label="Creado" value={formatDate(superAdmin.createdAt)} />
          <Row label="Ultima actualizacion" value={formatDate(superAdmin.updatedAt)} />
          <Row label="Ultimo acceso" value={formatDate(superAdmin.lastLoginAt)} />
          <Row label="Creado por" value={superAdmin.createdByName || "-"} />
          <Row label="Actualizado por" value={superAdmin.updatedByName || "-"} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
