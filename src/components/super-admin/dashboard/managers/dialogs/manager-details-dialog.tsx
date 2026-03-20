"use client";

import { Mail, Phone, IdCard, Calendar, Wallet, MapPin, Eye, UserRoundCog, BadgeCheck } from "lucide-react";

import type { ManagerRow } from "@/actions/super-admin/managers/types";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";


import { getManagerStatusInfo } from "../utils/manager-status";

interface Props {
  manager: ManagerRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function fmtDate(date: string | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function fmtMoney(value: number) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function ManagerDetailsDialog({ manager, open, onOpenChange }: Props) {
  if (!manager) return null;
  const status = getManagerStatusInfo(manager.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="size-5 text-primary" />
            Detalle del encargado de sucursal: {manager.fullName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <section className="grid gap-2 text-sm sm:grid-cols-2">
            <Row icon={IdCard} label="CI" value={manager.ci} />
            <Row icon={Mail} label="Correo" value={manager.email} />
            <Row icon={Phone} label="Telefono" value={manager.phone ?? "Sin telefono"} />
            <Row icon={Calendar} label="Nacimiento" value={fmtDate(manager.birthDate)} />
            <Row icon={Calendar} label="Ingreso" value={fmtDate(manager.hireDate)} />
            <Row icon={BadgeCheck} label="Pago de ingreso registrado" value={manager.receivesSalary ? "Si" : "No"} />
            <Row icon={Wallet} label="Monto de ingreso (BOL)" value={fmtMoney(manager.salary)} />
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">Estado: </span>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Direccion</h4>
            <p className="text-sm font-medium">{manager.homeAddress || "Sin direccion registrada"}</p>
          </section>

          <Separator />

          <section className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Sucursales asignadas</h4>
            {manager.branches.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin sucursales asignadas.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {manager.branches.map((branch) => (
                  <Badge key={branch.id} variant="secondary">
                    {branch.name} ({branch.city})
                  </Badge>
                ))}
              </div>
            )}
          </section>

          <Separator />

          <section className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Trazabilidad</h4>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <Row icon={UserRoundCog} label="Creado por" value={manager.createdByName ?? "No disponible"} />
              <Row icon={Calendar} label="Creado el" value={fmtDate(manager.createdAt)} />
              <Row icon={UserRoundCog} label="Actualizado por" value={manager.updatedByName ?? "No disponible"} />
              <Row icon={Calendar} label="Actualizado el" value={fmtDate(manager.updatedAt)} />
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div>
        <span className="text-muted-foreground">{label}: </span>
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
}

