"use client";

import type { SuperAdminRow } from "@/actions/super-admin/superadmins/types";

import {
  SuperAdminDeleteDialog,
  SuperAdminDetailsDialog,
  SuperAdminFormDialog,
  SuperAdminHistoryDialog,
  SuperAdminStatusDialog,
} from "../dialogs";
import { SuperAdminsFilters } from "../filters";
import { SuperAdminMetrics } from "../metrics";
import { SuperAdminsTable } from "../table";
import { useSuperAdminsPage } from "./use-superadmins-page";

type Props = {
  initialSuperAdmins: SuperAdminRow[];
};

export function SuperAdminsPageContent({ initialSuperAdmins }: Props) {
  const state = useSuperAdminsPage(initialSuperAdmins);

  return (
    <div className="space-y-6">
      <SuperAdminMetrics superAdmins={state.superAdmins} />

      <SuperAdminsFilters
        search={state.search}
        onSearchChange={state.setSearch}
        onCreate={() => {
          state.setSelected(null);
          state.setFormOpen(true);
        }}
      />

      <SuperAdminsTable
        superAdmins={state.filtered}
        onView={(row) => {
          state.setSelected(row);
          state.setDetailsOpen(true);
        }}
        onEdit={(row) => {
          state.setSelected(row);
          state.setFormOpen(true);
        }}
        onHistory={state.handleOpenHistory}
        onToggleStatus={(row) => {
          state.setSelected(row);
          state.setStatusError(null);
          state.setStatusOpen(true);
        }}
        onDelete={(row) => {
          state.setSelected(row);
          state.setDeleteError(null);
          state.setDeleteOpen(true);
        }}
      />

      <SuperAdminFormDialog
        open={state.formOpen}
        onOpenChange={(open) => {
          state.setFormOpen(open);
          if (!open) state.setSelected(null);
        }}
        superAdmin={state.selected}
        isPending={state.isPending}
        onCreate={state.handleCreate}
        onUpdate={state.handleUpdate}
      />

      <SuperAdminDetailsDialog
        open={state.detailsOpen}
        onOpenChange={(open) => {
          state.setDetailsOpen(open);
          if (!open) state.setSelected(null);
        }}
        superAdmin={state.selected}
      />

      <SuperAdminHistoryDialog
        open={state.historyOpen}
        onOpenChange={(open) => {
          state.setHistoryOpen(open);
          if (!open) {
            state.setSelected(null);
            state.setHistoryEntries([]);
          }
        }}
        superAdmin={state.selected}
        entries={state.historyEntries}
      />

      <SuperAdminStatusDialog
        open={state.statusOpen}
        onOpenChange={(open) => {
          state.setStatusOpen(open);
          if (!open) state.setSelected(null);
        }}
        superAdmin={state.selected}
        isPending={state.isPending}
        error={state.statusError}
        onConfirm={state.handleConfirmStatus}
      />

      <SuperAdminDeleteDialog
        open={state.deleteOpen}
        onOpenChange={(open) => {
          state.setDeleteOpen(open);
          if (!open) state.setSelected(null);
        }}
        superAdmin={state.selected}
        isPending={state.isPending}
        error={state.deleteError}
        onConfirm={state.handleConfirmDelete}
      />
    </div>
  );
}
