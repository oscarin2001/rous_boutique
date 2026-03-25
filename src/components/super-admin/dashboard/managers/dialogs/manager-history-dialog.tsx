"use client";

import React, { useState } from "react";

import { History, Loader2 } from "lucide-react";

import type { ManagerAuditEntry } from "@/actions/super-admin/managers/types";

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
  entries: ManagerAuditEntry[];
  isLoading: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  changedFrom: string;
  changedTo: string;
  latestDays: number | null;
  onChangedFromChange: (value: string) => void;
  onChangedToChange: (value: string) => void;
  onLatestDaysChange: (value: number | null) => void;
  onApplyDateRange: () => void;
  onApplyLatest: (days: number | null) => void;
}

type AuditPayload = Record<string, unknown>;
const DEFAULT_VISIBLE_CHANGES = 4;

const FIELD_LABELS: Record<string, string> = {
  firstName: "Nombre",
  lastName: "Apellido",
  ci: "CI",
  phone: "Telefono",
  email: "Correo",
  birthDate: "Fecha de nacimiento",
  hireDate: "Fecha de ingreso",
  receivesSalary: "Recibe pago",
  salary: "Pago de ingreso",
  branchIds: "Sucursales",
  status: "Estado",
  homeAddress: "Direccion",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  DEACTIVATED: "Desactivado",
  INACTIVE: "Inactivo",
};

function fmtDate(value: string) {
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
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

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "Sin asignar";

  if (key === "status" && typeof value === "string") {
    return STATUS_LABELS[value] ?? value;
  }

  if ((key === "birthDate" || key === "hireDate") && typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
    }
  }

  if (key === "receivesSalary" && typeof value === "boolean") {
    return value ? "Si" : "No";
  }

  if (key === "salary") {
    const numeric = typeof value === "number" ? value : Number(value);
    if (!Number.isNaN(numeric)) {
      return new Intl.NumberFormat("es-BO").format(numeric);
    }
  }

  if (key === "branchIds" && Array.isArray(value)) {
    return value.length > 0 ? `[${value.join(", ")}]` : "[]";
  }

  if (typeof value === "boolean") return value ? "Si" : "No";
  if (typeof value === "number") return new Intl.NumberFormat("es-BO").format(value);
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.length === 0 ? "Sin datos" : value.join(", ");

  return JSON.stringify(value);
}

function labelForField(key: string): string {
  return FIELD_LABELS[key] ?? key;
}

function actionLabel(action: ManagerAuditEntry["action"]): string {
  if (action === "CREATE") return "Creacion";
  if (action === "UPDATE") return "Actualizacion";
  return "Eliminacion";
}

function actionContextLabel(action: ManagerAuditEntry["action"]): string {
  if (action === "CREATE") return "creacion";
  if (action === "UPDATE") return "actualizacion";
  return "eliminacion";
}

function keysForEntry(entry: ManagerAuditEntry, oldPayload: AuditPayload | null, newPayload: AuditPayload | null): string[] {
  const keys = Array.from(new Set([...payloadKeys(oldPayload), ...payloadKeys(newPayload)]));
  if (entry.action !== "UPDATE") return keys;
  return keys.filter((key) => !areEqual(oldPayload?.[key], newPayload?.[key]));
}

function describeChange(action: ManagerAuditEntry["action"], key: string, oldValue: unknown, newValue: unknown): string {
  if (action === "CREATE") return formatValue(key, newValue);
  if (action === "DELETE") return formatValue(key, oldValue);
  return `${formatValue(key, oldValue)} -> ${formatValue(key, newValue)}`;
}

export const ManagerHistoryDialog = React.memo(function ManagerHistoryDialog({
  open,
  onOpenChange,
  entries,
  isLoading,
  hasMore,
  isLoadingMore,
  onLoadMore,
  changedFrom,
  changedTo,
  latestDays,
  onChangedFromChange,
  onChangedToChange,
  onLatestDaysChange,
  onApplyDateRange,
  onApplyLatest,
}: Props) {
  const [expandedEntryIds, setExpandedEntryIds] = useState<number[]>([]);
  const isInvalidDateRange = React.useMemo(() => Boolean(changedFrom && changedTo && changedFrom > changedTo), [changedFrom, changedTo]);

  const toggleExpanded = React.useCallback((id: number) => {
    setExpandedEntryIds((prev) => (prev.includes(id) ? prev.filter((entryId) => entryId !== id) : [...prev, id]));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            Historial del encargado de sucursal
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
          <p className="text-sm text-muted-foreground">No hay registros de auditoria.</p>
        ) : null}

        {!isLoading && entries.length > 0 ? (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {entries.map((entry) => (
              <article key={entry.id} className="rounded-lg border bg-muted/20 p-3">
                {(() => {
                  const oldPayload = parsePayload(entry.oldValue);
                  const newPayload = parsePayload(entry.newValue);
                  const keys = keysForEntry(entry, oldPayload, newPayload);
                  const isExpanded = expandedEntryIds.includes(entry.id);
                  const visibleKeys = isExpanded ? keys : keys.slice(0, DEFAULT_VISIBLE_CHANGES);
                  const hiddenCount = Math.max(0, keys.length - visibleKeys.length);

                  return (
                    <>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {actionLabel(entry.action)}
                    </span>
                    <span className="text-xs text-muted-foreground">{fmtDate(entry.createdAt)}</span>
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    Responsable: {entry.employeeName ?? "Sistema"}
                  </span>
                </div>

                {keys.length === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">Sin cambios detectados entre valor anterior y nuevo.</p>
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
                        {visibleKeys.map((key) => {
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

                    {hiddenCount > 0 ? (
                      <div className="border-t p-2">
                        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => toggleExpanded(entry.id)}>
                          Ver {hiddenCount} campo(s) mas de esta {actionContextLabel(entry.action)}
                        </Button>
                      </div>
                    ) : null}

                    {isExpanded && keys.length > DEFAULT_VISIBLE_CHANGES ? (
                      <div className="border-t p-2">
                        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => toggleExpanded(entry.id)}>
                          Ver menos
                        </Button>
                      </div>
                    ) : null}
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
});

