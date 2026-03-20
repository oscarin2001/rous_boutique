"use client";

import { Building2 } from "lucide-react";

import type { BranchRow } from "@/actions/super-admin/branches/types";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { BranchTableRow } from "./branch-table-row";

interface BranchesTableProps {
  branches: BranchRow[];
  onView: (branch: BranchRow) => void;
  onEdit: (branch: BranchRow) => void;
  onManage: (branch: BranchRow) => void;
  onHistory: (branch: BranchRow) => void;
  onDelete: (branch: BranchRow) => void;
}

export function BranchesTable({
  branches,
  onView,
  onEdit,
  onManage,
  onHistory,
  onDelete,
}: BranchesTableProps) {
  if (branches.length === 0) {
    return (
      <div className="rounded-lg border border-border/20 bg-card/60 p-8 text-center">
        <Building2 className="mx-auto mb-4 size-12 text-muted-foreground/50" />
        <h3 className="mb-1 text-lg font-medium">No hay sucursales</h3>
        <p className="text-sm text-muted-foreground">
          Crea tu primera sucursal para comenzar a gestionar tu negocio.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card/70 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead className="text-center">Empleados</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.map((branch) => (
            <BranchTableRow
              key={branch.id}
              branch={branch}
              onView={onView}
              onEdit={onEdit}
              onManage={onManage}
              onHistory={onHistory}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

