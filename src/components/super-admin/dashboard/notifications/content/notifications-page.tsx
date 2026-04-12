"use client";

import { Bell, CheckCheck, CircleOff, ListChecks, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { NotificationsControls } from "./notifications-controls";
import { NotificationsDeleteDialog } from "./notifications-delete-dialog";
import { NotificationsList } from "./notifications-list";
import { NotificationsPagination } from "./notifications-pagination";
import { useNotificationsPage } from "./use-notifications-page";

export function NotificationsPage() {
  const state = useNotificationsPage();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <NotificationsControls
          filter={state.filter}
          onFilterChange={(nextFilter) => {
            state.setPage(1);
            state.setFilter(nextFilter);
          }}
        />

        <section className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                title="Actualizar lista"
                aria-label="Actualizar lista"
                disabled={state.isPending}
                onClick={() => state.load(state.page, state.filter)}
              >
                <RefreshCw className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                title={state.allVisibleSelected ? "Quitar seleccion visible" : "Seleccionar visibles"}
                aria-label={state.allVisibleSelected ? "Quitar seleccion visible" : "Seleccionar visibles"}
                onClick={() => state.toggleSelectAllVisible(!state.allVisibleSelected)}
              >
                <ListChecks className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                title="Marcar leidas"
                aria-label="Marcar leidas"
                disabled={state.isPending || state.selectedVisibleCount === 0}
                onClick={() => state.setReadState(true)}
              >
                <CheckCheck className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                title="Marcar no leidas"
                aria-label="Marcar no leidas"
                disabled={state.isPending || state.selectedVisibleCount === 0}
                onClick={() => state.setReadState(false)}
              >
                <CircleOff className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                title="Eliminar seleccionadas"
                aria-label="Eliminar seleccionadas"
                disabled={state.isPending || state.selectedVisibleCount === 0}
                onClick={state.dismissSelected}
              >
                <Trash2 className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                title="Eliminar todo el filtro"
                aria-label="Eliminar todo el filtro"
                disabled={state.isPending || state.total === 0}
                onClick={() => state.setConfirmDeleteAllOpen(true)}
              >
                <Bell className="size-4" />
              </Button>
            </div>
          </div>

          <NotificationsList items={state.items} selected={state.selected} onToggleItem={state.toggleItem} />

          <NotificationsPagination
            page={state.page}
            pageCount={state.pageCount}
            isPending={state.isPending}
            onPrevious={() => state.load(state.page - 1, state.filter)}
            onNext={() => state.load(state.page + 1, state.filter)}
          />
        </section>
      </div>

      <NotificationsDeleteDialog
        open={state.confirmDeleteAllOpen}
        filter={state.filter}
        total={state.total}
        isPending={state.isPending}
        onOpenChange={state.setConfirmDeleteAllOpen}
        onConfirm={state.dismissAllInFilter}
      />
    </div>
  );
}
