import type { SupplierActionResult, SupplierBranchOption, SupplierHistoryRow, SupplierManagerOption, SupplierRow } from "@/actions/super-admin/suppliers/types";

import { SupplierDeleteDialog } from "@/components/super-admin/dashboard/suppliers/dialogs";
import { SupplierDetailsDialog } from "@/components/super-admin/dashboard/suppliers/dialogs";
import { SupplierHistoryDialog } from "@/components/super-admin/dashboard/suppliers/dialogs";
import { SupplierFormDialog } from "@/components/super-admin/dashboard/suppliers/form";

interface Props {
  selectedSupplier: SupplierRow | null;
  options: { branches: SupplierBranchOption[]; managers: SupplierManagerOption[] };
  formOpen: boolean;
  deleteOpen: boolean;
  detailsOpen: boolean;
  historyOpen?: boolean;
  historyRows?: SupplierHistoryRow[];
  historyLoading?: boolean;
  historyHasMore?: boolean;
  historyLoadingMore?: boolean;
  historyChangedFrom?: string;
  historyChangedTo?: string;
  historyLatestDays?: number | null;
  isPending: boolean;
  onFormOpenChange: (value: boolean) => void;
  onDeleteOpenChange: (value: boolean) => void;
  onDetailsOpenChange: (value: boolean) => void;
  onHistoryOpenChange?: (value: boolean) => void;
  onHistoryLoadMore?: () => void;
  onHistoryChangedFromChange?: (value: string) => void;
  onHistoryChangedToChange?: (value: string) => void;
  onHistoryLatestDaysChange?: (value: number | null) => void;
  onHistoryApplyDateRange?: () => void;
  onHistoryApplyLatest?: (days: number | null) => void;
  onSubmit: (data: Record<string, unknown>, id?: number) => Promise<SupplierActionResult>;
  onConfirmDelete: (password: string, reason: string) => void;
}

export function SuppliersPageDialogs({
  selectedSupplier,
  options,
  formOpen,
  deleteOpen,
  detailsOpen,
  historyOpen = false,
  historyRows = [],
  historyLoading = false,
  historyHasMore = false,
  historyLoadingMore = false,
  historyChangedFrom = "",
  historyChangedTo = "",
  historyLatestDays = 30,
  isPending,
  onFormOpenChange,
  onDeleteOpenChange,
  onDetailsOpenChange,
  onHistoryOpenChange = () => {},
  onHistoryLoadMore = () => {},
  onHistoryChangedFromChange = () => {},
  onHistoryChangedToChange = () => {},
  onHistoryLatestDaysChange = () => {},
  onHistoryApplyDateRange = () => {},
  onHistoryApplyLatest = () => {},
  onSubmit,
  onConfirmDelete,
}: Props) {
  return (
    <>
      <SupplierFormDialog
        open={formOpen}
        onOpenChange={onFormOpenChange}
        supplier={selectedSupplier}
        branchOptions={options.branches}
        managerOptions={options.managers}
        onSubmit={onSubmit}
        isPending={isPending}
      />
      <SupplierDeleteDialog
        open={deleteOpen}
        onOpenChange={onDeleteOpenChange}
        supplier={selectedSupplier}
        onConfirm={onConfirmDelete}
        isPending={isPending}
      />
      <SupplierDetailsDialog open={detailsOpen} onOpenChange={onDetailsOpenChange} supplier={selectedSupplier} />
      <SupplierHistoryDialog
        open={historyOpen}
        onOpenChange={onHistoryOpenChange}
        rows={historyRows}
        loading={historyLoading}
        hasMore={historyHasMore}
        isLoadingMore={historyLoadingMore}
        changedFrom={historyChangedFrom}
        changedTo={historyChangedTo}
        latestDays={historyLatestDays}
        onLoadMore={onHistoryLoadMore}
        onChangedFromChange={onHistoryChangedFromChange}
        onChangedToChange={onHistoryChangedToChange}
        onLatestDaysChange={onHistoryLatestDaysChange}
        onApplyDateRange={onHistoryApplyDateRange}
        onApplyLatest={onHistoryApplyLatest}
      />
    </>
  );
}
