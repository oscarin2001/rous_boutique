"use client";

import { 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  Eye, 
  History,
  CheckCircle2, 
  XCircle 
} from "lucide-react";

import type { SupplierRow } from "@/actions/super-admin/suppliers/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


interface Props {
  suppliers: SupplierRow[];
  onEdit: (supplier: SupplierRow) => void;
  onHistory: (supplier: SupplierRow) => void;
  onManage: (supplier: SupplierRow) => void;
  onDelete: (supplier: SupplierRow) => void;
  onToggleStatus: (supplier: SupplierRow) => void;
  onViewDetails: (supplier: SupplierRow) => void;
}

export function SuppliersTable({
  suppliers,
  onEdit,
  onHistory,
  onManage,
  onDelete,
  onToggleStatus,
  onViewDetails,
}: Props) {
  return (
    <div className="rounded-lg bg-card/70 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Proveedor</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Ciudad</TableHead>
            <TableHead>Sucursales</TableHead>
            <TableHead>Compras / Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">No se encontraron proveedores.</TableCell>
            </TableRow>
          ) : (
            suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{s.fullName}</span>
                    <span className="text-xs text-muted-foreground">{s.email || "Sin correo"}</span>
                  </div>
                </TableCell>
                <TableCell>{s.phone || "-"}</TableCell>
                <TableCell>{s.city || s.country || "-"}</TableCell>
                <TableCell>
                   <div className="flex flex-wrap gap-1">
                    {s.branches.slice(0, 2).map((b) => (
                      <Badge key={b.id} variant="secondary" className="text-[10px]">{b.name}</Badge>
                    ))}
                    {s.branches.length > 2 && <Badge variant="outline" className="text-[10px]">+{s.branches.length - 2}</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs">
                    <span>{s.purchaseCount} compras</span>
                    <span className="text-muted-foreground">{s.totalPurchaseAmount.toLocaleString()} BOB</span>
                  </div>
                </TableCell>
                <TableCell>
                   <Badge variant={s.isActive ? "default" : "outline"}>
                    {s.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" className="size-8 p-0">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      </DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => onViewDetails(s)}><Eye className="mr-2 size-4" /> Ver Detalles</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(s)}><Pencil className="mr-2 size-4" /> Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onHistory(s)}><History className="mr-2 size-4" /> Historial</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onManage(s)}><Eye className="mr-2 size-4" /> Gestionar asignaciones</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStatus(s)}>
                        {s.isActive ? (
                          <><XCircle className="mr-2 size-4 text-warning" /> Desactivar</>
                        ) : (
                          <><CheckCircle2 className="mr-2 size-4 text-success" /> Activar</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDelete(s)} className="text-destructive"><Trash className="mr-2 size-4" /> Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

