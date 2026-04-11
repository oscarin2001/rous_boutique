import { MoreHorizontal } from "lucide-react";

import type { SuperAdminRow } from "@/actions/super-admin/superadmins/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

type Props = {
  superAdmins: SuperAdminRow[];
  onView: (row: SuperAdminRow) => void;
  onEdit: (row: SuperAdminRow) => void;
  onHistory: (row: SuperAdminRow) => void;
  onToggleStatus: (row: SuperAdminRow) => void;
  onDelete: (row: SuperAdminRow) => void;
};

function statusVariant(status: SuperAdminRow["status"]) {
  if (status === "ACTIVE") return "secondary";
  if (status === "DEACTIVATED") return "outline";
  return "destructive";
}

function dateLabel(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function SuperAdminsTable({
  superAdmins,
  onView,
  onEdit,
  onHistory,
  onToggleStatus,
  onDelete,
}: Props) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>CI</TableHead>
            <TableHead>Telefono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead>Ultimo acceso</TableHead>
            <TableHead className="w-[48px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {superAdmins.length ? (
            superAdmins.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.fullName}</TableCell>
                <TableCell>@{row.username}</TableCell>
                <TableCell>{row.ci}</TableCell>
                <TableCell>{row.phone || "-"}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                </TableCell>
                <TableCell>{dateLabel(row.createdAt)}</TableCell>
                <TableCell>{dateLabel(row.lastLoginAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />} aria-label="Acciones">
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(row)}>Ver detalle</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(row)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onHistory(row)}>Historial</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onToggleStatus(row)}>
                        {row.status === "ACTIVE" ? "Desactivar" : "Activar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => onDelete(row)}>
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                No se encontraron super admins.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
