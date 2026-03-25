"use client";


import {
  MapPin,
  Phone,
  Calendar,
  Users,
  Hash,
  Eye,
  UserRoundCog,
} from "lucide-react";

import type { BranchRow } from "@/actions/super-admin/branches/types";


import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";


const DAY_NAMES = [
  "Domingo", "Lunes", "Martes", "Miércoles",
  "Jueves", "Viernes", "Sábado",
];

function fmt(date: string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(date));
}

interface Props {
  branch: BranchRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BranchDetailsDialog({ branch, open, onOpenChange }: Props) {
  if (!branch) return null;

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
            Detalle de sucursal: {branch.name}
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
              { label: "Dirección", value: branch.address },
              { label: "Ciudad", value: `${branch.city}${branch.department ? `, ${branch.department}` : ""} — ${branch.country}` },
              { label: "NIT", value: branch.nit || "Sin NIT" },
              { label: "Google Maps", value: branch.googleMaps ? <a href={branch.googleMaps} target="_blank" rel="noopener noreferrer" className="text-primary underline">Ver ubicación</a> : "Sin enlace" },
              { label: "Teléfono", value: branch.phone ?? "—" },
              { label: "Empleados", value: String(branch.employeeCount) },
              { label: "Gerente", value: branch.manager?.name ?? "Sin gerente" },
              { label: "Apertura", value: fmtDate(branch.openedAt) },
              { label: "Creada", value: fmtDate(branch.createdAt) },
              { label: "Creado por", value: branch.createdByName ?? "No disponible" },
              { label: "Actualizado por", value: branch.updatedByName ?? "No disponible" },
              { label: "Actualizado el", value: fmtDate(branch.updatedAt) },
              { label: "Gerentes asignados", value: branch.managers.length
                ? <div className="flex flex-wrap gap-2">{branch.managers.map((manager) => (
                    <Badge key={manager.id} variant="secondary">{manager.name}</Badge>
                  ))}</div>
                : <span className="text-muted-foreground">Sin gerentes asignados.</span> },
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

