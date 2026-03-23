"use client";

import { History, Loader2 } from "lucide-react";

import type { BranchAuditEntry } from "@/actions/super-admin/branches/types";

import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: BranchAuditEntry[];
  isLoading: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  changedFrom: string;
  changedTo: string;
  latestDays: number | null;
  onLoadMore: () => void;
  onChangedFromChange: (value: string) => void;
  onChangedToChange: (value: string) => void;
  onLatestDaysChange: (value: number | null) => void;
  onApplyDateRange: () => void;
  onApplyLatest: (days: number | null) => void;
}

type AuditPayload = Record<string, unknown>;

const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  nit: "NIT",
  phone: "Telefono",
  address: "Direccion",
  city: "Ciudad",
  department: "Departamento",
  country: "Pais",
  googleMaps: "Google Maps",
  managerId: "Encargado",
  openedAt: "Fecha de apertura",
  status: "Estado",
  supplierIds: "Proveedores",
  warehouseIds: "Bodegas",
  managers: "Encargados",
  suppliers: "Proveedores",
  warehouses: "Bodegas",
};

const ACTION_LABELS: Record<BranchAuditEntry["action"], string> = {
  CREATE: "Creacion",
  UPDATE: "Actualizacion",
  DELETE: "Eliminacion",
};

function fmt(date: string) {
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function parsePayload(value: string | null): AuditPayload | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      return { value: parsed };
    }
    return parsed as AuditPayload;
  } catch {
    return { value };
  }
}

function payloadKeys(payload: AuditPayload | null): string[] {
  if (!payload) return [];
  return Object.keys(payload);
}

function areEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function formatArray(value: unknown[]): string {
  if (value.length === 0) return "Sin datos";

  if (value.every((item) => typeof item === "string" || typeof item === "number")) {
    return value.join(", ");
  }

  if (value.every((item) => typeof item === "object" && item !== null)) {
    const labels = value
      .map((item) => {
        const row = item as Record<string, unknown>;
        if (typeof row.name === "string") return row.name;
        if (typeof row.fullName === "string") return row.fullName;
        return null;
      })
      .filter((item): item is string => item !== null);

    if (labels.length > 0) return labels.join(", ");
  }

  return `${value.length} elemento(s)`;
}

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "Sin asignar";

  if (key === "openedAt" && typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
    }
  }

  if (typeof value === "boolean") return value ? "Si" : "No";
  if (typeof value === "number") return new Intl.NumberFormat("es-BO").format(value);
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    if (key === "supplierIds" || key === "suppliers") {
      return value.length > 0 ? `${value.length} proveedor(es)` : "Sin proveedor asignado";
    }
    if (key === "warehouseIds" || key === "warehouses") {
      return value.length > 0 ? `${value.length} bodega(s)` : "Sin bodega asignada";
    }
    if (key === "managerIds" || key === "managers") {
      return value.length > 0 ? `${value.length} encargado(s)` : "Sin encargado asignado";
    }
    return formatArray(value);
  }

  return JSON.stringify(value);
}

function labelForField(key: string): string {
  return FIELD_LABELS[key] ?? key;
}

function keysForEntry(entry: BranchAuditEntry, oldPayload: AuditPayload | null, newPayload: AuditPayload | null): string[] {
  const keys = Array.from(new Set([...payloadKeys(oldPayload), ...payloadKeys(newPayload)]));
  if (entry.action !== "UPDATE") return keys;
  return keys.filter((key) => !areEqual(oldPayload?.[key], newPayload?.[key]));
}

function describeChange(action: BranchAuditEntry["action"], key: string, oldValue: unknown, newValue: unknown): string {
  if (action === "CREATE") return formatValue(key, newValue);
  if (action === "DELETE") return formatValue(key, oldValue);
  return `${formatValue(key, oldValue)} -> ${formatValue(key, newValue)}`;
}

function actionContextLabel(action: BranchAuditEntry["action"]): string {
  if (action === "CREATE") return "creacion";
  if (action === "UPDATE") return "actualizacion";
  return "eliminacion";
}

export function BranchHistoryDialog({
  open,
  onOpenChange,
  entries,
  isLoading,
  hasMore,
  isLoadingMore,
  changedFrom,
  changedTo,
  latestDays,
  onLoadMore,
  onChangedFromChange,
  onChangedToChange,
  onLatestDaysChange,
  onApplyDateRange,
  onApplyLatest,
}: Props) {
  const isInvalidDateRange = Boolean(changedFrom && changedTo && changedFrom > changedTo);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            Historial de la sucursal
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-md border bg-muted/20 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant={latestDays === 7 ? "default" : "outline"} onClick={() => { onLatestDaysChange(7); onApplyLatest(7); }}>
              Ultimos 7 dias
            </Button>
            <Button type="button" size="sm" variant={latestDays === 30 ? "default" : "outline"} onClick={() => { onLatestDaysChange(30); onApplyLatest(30); }}>
              Ultimos 30 dias
            </Button>
            <Button type="button" size="sm" variant={latestDays === null ? "default" : "outline"} onClick={() => { onLatestDaysChange(null); onApplyLatest(null); }}>
              Todos
            </Button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Desde cuando</p>
              <DateInput value={changedFrom} onValueChange={onChangedFromChange} placeholder="Seleccionar fecha inicial" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Hasta cuando</p>
              <DateInput value={changedTo} onValueChange={onChangedToChange} placeholder="Seleccionar fecha final" />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="outline" disabled={isInvalidDateRange} onClick={onApplyDateRange}>Aplicar rango</Button>
            </div>
          </div>
          {isInvalidDateRange ? <p className="mt-2 text-xs text-destructive">La fecha Desde cuando no puede ser mayor que Hasta cuando.</p> : null}
        </div>

        {isLoading ? <p className="text-sm text-muted-foreground">Cargando historial...</p> : null}

        {!isLoading && entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay registros de auditoría.</p>
        ) : null}

        {!isLoading && entries.length > 0 ? (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {entries.map((entry) => (
              <article key={entry.id} className="rounded-lg border bg-muted/20 p-3">
                {(() => {
                  const oldPayload = parsePayload(entry.oldValue);
                  const newPayload = parsePayload(entry.newValue);
                  const keys = keysForEntry(entry, oldPayload, newPayload);

                  return (
                    <>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {ACTION_LABELS[entry.action]}
                    </span>
                    <span className="text-xs text-muted-foreground">{fmt(entry.createdAt)}</span>
                  </div>
                  <span className="text-xs font-medium text-foreground">Responsable: {entry.employeeName ?? "Sistema"}</span>
                </div>

                {keys.length === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">Sin cambios visibles.</p>
                ) : (
                  <div className="mt-3 overflow-hidden rounded-md border bg-background/40">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[180px]">Campo</TableHead>
                          <TableHead>Cambio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {keys.map((key) => {
                          const oldValue = oldPayload?.[key];
                          const newValue = newPayload?.[key];

                          return (
                            <TableRow key={`${entry.id}-${key}`}>
                              <TableCell className="align-top text-xs font-medium text-muted-foreground">{labelForField(key)}</TableCell>
                              <TableCell className="text-xs whitespace-normal break-words">{describeChange(entry.action, key, oldValue, newValue)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    <div className="border-t p-2 text-[11px] text-muted-foreground">Mostrando {keys.length} campo(s) de esta {actionContextLabel(entry.action)}.</div>
                  </div>
                )}
                    </>
                  );
                })()}
              </article>
            ))}

            {hasMore ? (
              <div className="flex justify-center pt-1">
                <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isLoadingMore}>
                  {isLoadingMore ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  {isLoadingMore ? "Cargando..." : "Cargar mas"}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

