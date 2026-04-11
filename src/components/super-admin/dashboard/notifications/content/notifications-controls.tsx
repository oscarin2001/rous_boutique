"use client";

import { Bell, CheckCheck, RefreshCw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { categoryLabel, type CategoryFilter } from "./notifications.types";

type Props = {
  filter: CategoryFilter;
  total: number;
  isPending: boolean;
  selectedVisibleCount: number;
  allVisibleSelected: boolean;
  onFilterChange: (filter: CategoryFilter) => void;
  onSelectAll: (checked: boolean) => void;
  onRefresh: () => void;
  onMarkRead: () => void;
  onDeleteSelected: () => void;
  onDeleteAll: () => void;
};

const FILTERS: CategoryFilter[] = ["all", "security", "system", "account"];

function filterLabel(filter: CategoryFilter) {
  return filter === "all" ? "Todo" : categoryLabel[filter];
}

export function NotificationsControls({
  filter,
  total,
  isPending,
  selectedVisibleCount,
  allVisibleSelected,
  onFilterChange,
  onSelectAll,
  onRefresh,
  onMarkRead,
  onDeleteSelected,
  onDeleteAll,
}: Props) {
  return (
    <aside className="space-y-4 rounded-xl border border-border/50 bg-card p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold">Filtros</p>
        <p className="text-xs text-muted-foreground">Selecciona categoria y ejecuta acciones masivas.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Button
            key={item}
            type="button"
            size="sm"
            variant={filter === item ? "default" : "outline"}
            onClick={() => onFilterChange(item)}
          >
            {filterLabel(item)}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Total visible</span>
          <Badge variant="outline">{total}</Badge>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Seleccionadas</span>
          <Badge variant="secondary">{selectedVisibleCount}</Badge>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button type="button" variant="outline" disabled={isPending} onClick={onRefresh}>
          <RefreshCw className="size-4" />
          Actualizar lista
        </Button>
        <Button type="button" variant="outline" disabled={isPending || selectedVisibleCount === 0} onClick={onMarkRead}>
          <CheckCheck className="size-4" />
          Marcar leidas
        </Button>
        <Button type="button" variant="outline" disabled={isPending || selectedVisibleCount === 0} onClick={onDeleteSelected}>
          <Trash2 className="size-4" />
          Eliminar seleccionadas
        </Button>
        <Button type="button" variant="destructive" disabled={isPending || total === 0} onClick={onDeleteAll}>
          <Bell className="size-4" />
          Eliminar todo el filtro
        </Button>
      </div>

      <Button type="button" variant="ghost" className="w-full" onClick={() => onSelectAll(!allVisibleSelected)}>
        {allVisibleSelected ? "Quitar seleccion visible" : "Seleccionar visibles"}
      </Button>
    </aside>
  );
}
