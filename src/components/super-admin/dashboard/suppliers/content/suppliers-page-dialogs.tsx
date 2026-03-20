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
  historyOpen: boolean;
  historyRows: SupplierHistoryRow[];
  historyLoading: boolean;
  isPending: boolean;
  onFormOpenChange: (value: boolean) => void;
  onDeleteOpenChange: (value: boolean) => void;
  onDetailsOpenChange: (value: boolean) => void;
  onHistoryOpenChange: (value: boolean) => void;
  onSubmit: (data: Record<string, unknown>, id?: number) => Promise<SupplierActionResult>;
  onConfirmDelete: (password: string) => void;
}

export function SuppliersPageDialogs({
  selectedSupplier,
  options,
  formOpen,
  deleteOpen,
  detailsOpen,
  historyOpen,
  historyRows,
  historyLoading,
  isPending,
  onFormOpenChange,
  onDeleteOpenChange,
  onDetailsOpenChange,
  onHistoryOpenChange,
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
      <SupplierHistoryDialog open={historyOpen} onOpenChange={onHistoryOpenChange} rows={historyRows} loading={historyLoading} />
    </>
  );
}
