"use client";

import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  History,
  MapPin,
  Wrench,
  Users,
} from "lucide-react";

import type { BranchRow } from "@/actions/super-admin/branches/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";


import { getBranchStatus } from "../utils/branch-status";

interface BranchTableRowProps {
  branch: BranchRow;
  onView: (branch: BranchRow) => void;
  onEdit: (branch: BranchRow) => void;
  onManage: (branch: BranchRow) => void;
  onHistory: (branch: BranchRow) => void;
  onDelete: (branch: BranchRow) => void;
}

export function BranchTableRow({
  branch,
  onView,
  onEdit,
  onManage,
  onHistory,
  onDelete,
}: BranchTableRowProps) {
  const status = getBranchStatus(branch);

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="font-medium">{branch.name}</TableCell>
      <TableCell>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3" />
          {branch.city}
          {branch.department ? `, ${branch.department}` : ""}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span className="flex items-center justify-center gap-1 text-sm">
          <Users className="size-3 text-muted-foreground" />
          {branch.employeeCount}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant={status.variant}>{status.label}</Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" />
            }
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Acciones</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(branch)}>
              <Eye className="mr-2 size-4" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(branch)}>
              <Edit className="mr-2 size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onManage(branch)}>
              <Wrench className="mr-2 size-4" />
              Gestionar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onHistory(branch)}>
              <History className="mr-2 size-4" />
              Historial
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(branch)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

