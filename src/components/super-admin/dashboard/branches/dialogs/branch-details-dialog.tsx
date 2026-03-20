"use client";

import {
  MapPin,
  Phone,
  Calendar,
  Users,
  Clock,
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
import { Separator } from "@/components/ui/separator";


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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="size-5 text-primary" />
            Detalle de sucursal: {branch.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Location */}
          <section className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Ubicación
            </h4>
            <div className="grid gap-2 text-sm">
              <Row icon={MapPin} label="Dirección" value={branch.address} />
              <Row
                icon={MapPin}
                label="Ciudad"
                value={`${branch.city}${branch.department ? `, ${branch.department}` : ""} — ${branch.country}`}
              />
              {branch.nit && (
                <Row icon={Hash} label="NIT" value={branch.nit} />
              )}
              {branch.googleMaps && (
                <Row
                  icon={MapPin}
                  label="Google Maps"
                  value="Ver ubicacion"
                  href={branch.googleMaps}
                />
              )}
            </div>
          </section>

          <Separator />

          {/* Contact & dates */}
          <section className="grid gap-2 text-sm sm:grid-cols-2">
            <Row icon={Phone} label="Teléfono" value={branch.phone ?? "—"} />
            <Row icon={Users} label="Empleados" value={String(branch.employeeCount)} />
            <Row icon={Users} label="Gerente" value={branch.manager?.name ?? "Sin gerente"} />
            <Row icon={Calendar} label="Apertura" value={fmt(branch.openedAt)} />
            <Row icon={Calendar} label="Creada" value={fmt(branch.createdAt)} />
          </section>

          <Separator />

          <section className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Trazabilidad</h4>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <Row icon={UserRoundCog} label="Creado por" value={branch.createdByName ?? "No disponible"} />
              <Row icon={Calendar} label="Creado el" value={fmt(branch.createdAt)} />
              <Row icon={UserRoundCog} label="Actualizado por" value={branch.updatedByName ?? "No disponible"} />
              <Row icon={Calendar} label="Actualizado el" value={fmt(branch.updatedAt)} />
            </div>
          </section>

          <Separator />

          <section className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Gerentes asignados</h4>
            {branch.managers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin gerentes asignados.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {branch.managers.map((manager) => (
                  <Badge key={manager.id} variant="secondary">{manager.name}</Badge>
                ))}
              </div>
            )}
          </section>

          <Separator />

          <section className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Almacenes asignados</h4>
            {branch.warehouses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin almacenes asignados.</p>
            ) : (
              <div className="grid gap-2 text-sm">
                {branch.warehouses.map((warehouse) => (
                  <div key={warehouse.id} className="flex items-center justify-between rounded bg-muted/30 p-2">
                    <div>
                      <p className="font-medium">{warehouse.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {warehouse.address}, {warehouse.city}
                        {warehouse.department ? `, ${warehouse.department}` : ""}
                      </p>
                    </div>
                    {warehouse.isPrimary ? <Badge>Principal</Badge> : null}
                  </div>
                ))}
              </div>
            )}
          </section>

          <Separator />

          <section className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Proveedores asignados</h4>
            {branch.suppliers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin proveedores asignados.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {branch.suppliers.map((supplier) => (
                  <Badge key={supplier.id} variant="outline">
                    {supplier.name}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          {/* Hours */}
          {branch.hours.length > 0 && (
            <>
              <Separator />
              <section className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <Clock className="size-4" /> Horario de Atención
                </h4>
                <div className="grid gap-1 text-sm">
                  {branch.hours.map((h) => (
                    <div key={h.dayOfWeek} className="flex justify-between">
                      <span>{DAY_NAMES[h.dayOfWeek]}</span>
                      {h.isClosed ? (
                        <Badge variant="secondary">Cerrado</Badge>
                      ) : (
                        <span>{h.openingTime} – {h.closingTime}</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div>
        <span className="text-muted-foreground">{label}: </span>
        {href ? (
          <a className="font-medium text-primary underline underline-offset-4" href={href} target="_blank" rel="noreferrer">
            {value}
          </a>
        ) : (
          <span className="font-medium">{value}</span>
        )}
      </div>
    </div>
  );
}

