"use client";

import { Users } from "lucide-react";

import type { ManagerRow } from "@/actions/super-admin/managers/types";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ManagersTableRow } from "./managers-table-row";

interface Props {
  managers: ManagerRow[];
  onView: (manager: ManagerRow) => void;
  onEdit: (manager: ManagerRow) => void;
  onManage: (manager: ManagerRow) => void;
  onHistory: (manager: ManagerRow) => void;
  onToggleStatus: (manager: ManagerRow) => void;
  onDelete: (manager: ManagerRow) => void;
}

export function ManagersTable({ managers, onView, onEdit, onManage, onHistory, onToggleStatus, onDelete }: Props) {
  if (managers.length === 0) {
    return (
      <div className="rounded-lg border border-border/20 bg-card/60 p-8 text-center">
        <Users className="mx-auto mb-4 size-12 text-muted-foreground/50" />
        <h3 className="mb-1 text-lg font-medium">No hay encargados de sucursal</h3>
        <p className="text-sm text-muted-foreground">Crea tu primer encargado de sucursal para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card/70 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Encargado de sucursal</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Sucursales</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Pago de ingreso</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {managers.map((manager) => (
            <ManagersTableRow
              key={manager.id}
              manager={manager}
              onView={onView}
              onEdit={onEdit}
              onManage={onManage}
              onHistory={onHistory}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

