"use client";

import { MoreHorizontal, Eye, Edit, Trash2, Power, History, Building2 } from "lucide-react";

import type { ManagerRow } from "@/actions/super-admin/managers/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";

import { getManagerStatusInfo } from "../utils/manager-status";

interface Props {
  manager: ManagerRow;
  onView: (manager: ManagerRow) => void;
  onEdit: (manager: ManagerRow) => void;
  onManage: (manager: ManagerRow) => void;
  onHistory: (manager: ManagerRow) => void;
  onToggleStatus: (manager: ManagerRow) => void;
  onDelete: (manager: ManagerRow) => void;
}

export function ManagersTableRow({ manager, onView, onEdit, onManage, onHistory, onToggleStatus, onDelete }: Props) {
  const status = getManagerStatusInfo(manager.status);

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell>
        <div>
          <p className="font-medium">{manager.fullName}</p>
          <p className="text-xs text-muted-foreground">CI: {manager.ci}</p>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="text-sm">{manager.email}</p>
          <p className="text-xs text-muted-foreground">{manager.phone ?? "Sin telefono"}</p>
        </div>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-1 text-sm">
          <Building2 className="size-3 text-muted-foreground" />
          {manager.branches.length}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant={status.variant}>{status.label}</Badge>
      </TableCell>
      <TableCell className="text-right">{new Intl.NumberFormat("es-BO").format(manager.salary)}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Acciones</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(manager)}>
              <Eye className="mr-2 size-4" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(manager)}>
              <Edit className="mr-2 size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onManage(manager)}>
              <Building2 className="mr-2 size-4" />
              Gestionar asignaciones
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onHistory(manager)}>
              <History className="mr-2 size-4" />
              Historial
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus(manager)}>
              <Power className="mr-2 size-4" />
              {manager.status === "ACTIVE" ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(manager)}>
              <Trash2 className="mr-2 size-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

