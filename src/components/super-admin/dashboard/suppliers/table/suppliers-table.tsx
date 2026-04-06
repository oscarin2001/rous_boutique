"use client";

import { MoreHorizontal, Pencil, Trash2, Eye, History, CheckCircle2, XCircle, Users } from "lucide-react";

import type { SupplierRow } from "@/actions/super-admin/suppliers/types";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
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
  if (suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/50 py-16">
        <div className="rounded-full bg-muted/50 p-4">
          <Users className="size-12 text-muted-foreground/60" />
        </div>
        <h3 className="mt-6 text-xl font-semibold">No hay proveedores registrados</h3>
        <p className="mt-2 max-w-sm text-center text-muted-foreground">
          Comienza agregando tus aliados comerciales para gestionar compras y asignaciones.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[280px]">Proveedor</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Ciudad / País</TableHead>
            <TableHead>Sucursales</TableHead>
            <TableHead className="text-right">Compras</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id} className="group hover:bg-muted/50 transition-colors">
              {/* Proveedor */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium">
                      {supplier.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{supplier.fullName}</span>
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {supplier.email || "Sin correo electrónico"}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* Contacto */}
              <TableCell>
                <div className="text-sm">
                  {supplier.phone ? (
                    <span className="font-medium">{supplier.phone}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </TableCell>

              {/* Ciudad */}
              <TableCell className="text-sm">
                {supplier.city && supplier.country
                  ? `${supplier.city}, ${supplier.country}`
                  : supplier.city || supplier.country || "—"}
              </TableCell>

              {/* Sucursales */}
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {supplier.branches.slice(0, 3).map((branch) => (
                    <Badge key={branch.id} variant="secondary" className="text-xs font-normal">
                      {branch.name}
                    </Badge>
                  ))}
                  {supplier.branches.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{supplier.branches.length - 3}
                    </Badge>
                  )}
                  {supplier.branches.length === 0 && (
                    <span className="text-xs text-muted-foreground">Sin sucursales</span>
                  )}
                </div>
              </TableCell>

              {/* Compras */}
              <TableCell className="text-right">
                <div className="flex flex-col items-end text-sm">
                  <span className="font-medium">{supplier.purchaseCount} compras</span>
                  <span className="text-muted-foreground font-medium">
                    {supplier.totalPurchaseAmount.toLocaleString("es-BO")} BOB
                  </span>
                </div>
              </TableCell>

              {/* Estado */}
              <TableCell className="text-center">
                <Badge
                  variant={supplier.isActive ? "default" : "secondary"}
                  className={`font-medium ${supplier.isActive ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                >
                  {supplier.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>

              {/* Acciones */}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={(
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    )}
                  />

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onViewDetails(supplier)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(supplier)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar proveedor
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onHistory(supplier)}>
                      <History className="mr-2 h-4 w-4" />
                      Ver historial
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onManage(supplier)}>
                      <Users className="mr-2 h-4 w-4" />
                      Gestionar asignaciones
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => onToggleStatus(supplier)}>
                      {supplier.isActive ? (
                        <>
                          <XCircle className="mr-2 h-4 w-4 text-amber-500" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                          Activar
                        </>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => onDelete(supplier)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar proveedor
                    </DropdownMenuItem>
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