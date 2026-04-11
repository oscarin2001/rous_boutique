"use client";

import { Bell } from "lucide-react";

import { PageHeaderCard } from "@/components/super-admin/dashboard/shared/page-header-card";

import { NotificationsControls } from "./notifications-controls";
import { NotificationsDeleteDialog } from "./notifications-delete-dialog";
import { NotificationsList } from "./notifications-list";
import { NotificationsPagination } from "./notifications-pagination";
import { useNotificationsPage } from "./use-notifications-page";

export function NotificationsPage() {
  const state = useNotificationsPage();

  return (
    <div className="space-y-6">
      <PageHeaderCard
        icon={Bell}
        eyebrow="Mensajes"
        title="Notificaciones"
        description="Centro de eventos operativos y de seguridad con acciones masivas y estado de lectura."
      />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <NotificationsControls
          filter={state.filter}
          total={state.total}
          isPending={state.isPending}
          selectedVisibleCount={state.selectedVisibleCount}
          allVisibleSelected={state.allVisibleSelected}
          onFilterChange={(nextFilter) => {
            state.setPage(1);
            state.setFilter(nextFilter);
          }}
          onSelectAll={state.toggleSelectAllVisible}
          onRefresh={() => state.load(state.page, state.filter)}
          onMarkRead={() => state.setReadState(true)}
          onDeleteSelected={state.dismissSelected}
          onDeleteAll={() => state.setConfirmDeleteAllOpen(true)}
        />

        <section className="space-y-4">
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
