"use client";

import React from "react";

import { Eye } from "lucide-react";

import type { ManagerRow } from "@/actions/super-admin/managers/types";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";


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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campo</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(
                [
                  { label: "CI", value: manager.ci },
                  { label: "Correo", value: manager.email },
                  { label: "Telefono", value: manager.phone ?? "Sin telefono" },
                  { label: "Nacimiento", value: fmtDate(manager.birthDate) },
                  { label: "Fecha de ingreso a Rous Boutique", value: fmtDate(manager.hireDate) },
                  { label: "Pago de ingreso registrado", value: manager.receivesSalary ? "Si" : "No" },
                  { label: "Monto de ingreso (BOL)", value: fmtMoney(manager.salary) },
                  { label: "Estado", value: status.label },
                  { label: "Direccion", value: manager.homeAddress ?? "Sin direccion registrada" },
                  { label: "Sucursales asignadas", value: manager.branches.length ? manager.branches.map(b => `${b.name} (${b.city})`).join(", ") : "Sin sucursales asignadas" },
                  { label: "Creado por", value: manager.createdByName ?? "No disponible" },
                  { label: "Creado el", value: fmtDate(manager.createdAt) },
                  { label: "Actualizado por", value: manager.updatedByName ?? "No disponible" },
                  { label: "Actualizado el", value: fmtDate(manager.updatedAt) },
                ] as { label: string; value: string }[]
              )
                .sort((a, b) => a.label.localeCompare(b.label, "es"))
                .map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="font-medium text-sm text-muted-foreground">{row.label}</TableCell>
                    <TableCell className="text-sm">{row.value}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

 

