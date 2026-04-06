"use client";

import React from "react";

import {
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  CheckCircle,
  Building2,
  UserPlus,
  Clock,
  UserCog,
  Eye,
} from "lucide-react";

import type { ManagerRow } from "@/actions/super-admin/managers/types";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
              <Eye className="size-6" />
            </div>
            <div>
              <span className="block">Detalle del Encargado</span>
              <span className="text-base font-medium text-foreground">
                {manager.fullName}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Información Personal */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Información Personal
            </h3>
            <div className="grid gap-3">
              <InfoRow
                icon={<Mail className="size-4" />}
                label="Correo Electrónico"
                value={manager.email}
              />
              <InfoRow
                icon={<Phone className="size-4" />}
                label="Teléfono"
                value={manager.phone ?? "Sin teléfono registrado"}
              />
              <InfoRow
                icon={<Calendar className="size-4" />}
                label="Fecha de Nacimiento"
                value={fmtDate(manager.birthDate)}
              />
              <InfoRow
                icon={<MapPin className="size-4" />}
                label="Dirección"
                value={manager.homeAddress ?? "Sin dirección registrada"}
              />
            </div>
          </section>

          <Separator />

          {/* Información Laboral */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Información Laboral
            </h3>
            <div className="grid gap-3">
              <InfoRow
                icon={<Briefcase className="size-4" />}
                label="Fecha de Ingreso"
                value={fmtDate(manager.hireDate)}
              />
              <InfoRow
                icon={<DollarSign className="size-4" />}
                label="Salario"
                value={
                  manager.receivesSalary
                    ? fmtMoney(manager.salary)
                    : "No recibe salario"
                }
              />
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-md bg-muted text-muted-foreground">
                  <CheckCircle className="size-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <Badge
                    variant="default"
                    className="mt-0.5"
                  >
                    {status.label}
                  </Badge>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Sucursales Asignadas */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Sucursales Asignadas
            </h3>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-dashed">
              <Building2 className="size-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {manager.branches.length > 0
                  ? manager.branches.map((b) => `${b.name} (${b.city})`).join(", ")
                  : "Sin sucursales asignadas"}
              </span>
            </div>
          </section>

          <Separator />

          {/* Registro / Metadatos */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Registro
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <MetaInfo
                icon={<UserPlus className="size-3.5" />}
                label="Creado por"
                value={manager.createdByName ?? "No disponible"}
              />
              <MetaInfo
                icon={<Clock className="size-3.5" />}
                label="Creado el"
                value={fmtDate(manager.createdAt)}
              />
              <MetaInfo
                icon={<UserCog className="size-3.5" />}
                label="Actualizado por"
                value={manager.updatedByName ?? "No disponible"}
              />
              <MetaInfo
                icon={<Clock className="size-3.5" />}
                label="Actualizado el"
                value={fmtDate(manager.updatedAt)}
              />
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componentes auxiliares (igual que en tu ejemplo)
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center size-8 rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

function MetaInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/30">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xs font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
