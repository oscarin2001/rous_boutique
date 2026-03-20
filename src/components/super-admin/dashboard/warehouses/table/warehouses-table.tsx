import { MoreHorizontal } from "lucide-react";

import type { WarehouseRow } from "@/actions/super-admin/warehouses/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


interface Props {
  rows: WarehouseRow[];
  onView: (row: WarehouseRow) => void;
  onEdit: (row: WarehouseRow) => void;
  onManage: (row: WarehouseRow) => void;
  onHistory: (row: WarehouseRow) => void;
  onDelete: (row: WarehouseRow) => void;
}

export function WarehousesTable({ rows, onView, onEdit, onManage, onHistory, onDelete }: Props) {
  return (
    <div className="rounded-xl bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bodega</TableHead>
            <TableHead>Ubicacion</TableHead>
            <TableHead>Asignaciones</TableHead>
            <TableHead className="w-[56px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="h-20 text-center">No hay bodegas registradas.</TableCell></TableRow>
          ) : rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <p className="font-medium">{row.name}</p>
                <p className="text-xs text-muted-foreground">{row.phone || "Sin telefono"}</p>
              </TableCell>
              <TableCell>
                <p>{row.city}, {row.country}</p>
                <p className="text-xs text-muted-foreground">{row.address}</p>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Badge className="border-0 bg-muted text-foreground">{row.branches.length} sucursal(es)</Badge>
                  <Badge variant="secondary">{row.managers.length} encargado(s)</Badge>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost"><MoreHorizontal className="size-4" /></Button>} />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(row)}>Ver detalle</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(row)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onManage(row)}>Gestionar asignaciones</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onHistory(row)}>Historial</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(row)} variant="destructive">Eliminar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

