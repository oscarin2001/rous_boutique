


"use client";

import { Eye } from "lucide-react";

import type { ManagerRow } from "@/actions/super-admin/managers/types";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";

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
        <div className="py-2">
          <Table>
            <TableBody>
              <TableRow>
                <TableHead>CI</TableHead>
                <TableCell>{manager.ci}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Correo electrónico</TableHead>
                <TableCell>{manager.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Teléfono</TableHead>
                <TableCell>{manager.phone ?? "Sin teléfono"}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Fecha de nacimiento</TableHead>
                <TableCell>{fmtDate(manager.birthDate)}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Fecha de ingreso a la empresa</TableHead>
                <TableCell>{fmtDate(manager.hireDate)}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Recibe salario</TableHead>
                <TableCell>{manager.receivesSalary ? "Sí" : "No"}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Monto de salario</TableHead>
                <TableCell>{fmtMoney(manager.salary)}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Estado</TableHead>
                <TableCell><Badge variant={status.variant} className="w-fit">{status.label}</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Dirección de residencia</TableHead>
                <TableCell>
                  {manager.homeAddress ? (
                    <span>{manager.homeAddress}</span>
                  ) : (
                    <span className="text-muted-foreground">Sin dirección registrada</span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Sucursales asignadas</TableHead>
                <TableCell>
                  {manager.branches.length === 0 ? (
                    <span className="text-muted-foreground">Sin sucursales asignadas.</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {manager.branches.map((branch) => (
                        <Badge key={branch.id} variant="secondary">
                          {branch.name} ({branch.city})
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

