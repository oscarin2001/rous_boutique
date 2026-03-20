import type { SupplierRow } from "@/actions/super-admin/suppliers/types";

import { SuppliersFilters } from "@/components/super-admin/dashboard/suppliers/filters";
import { SuppliersTable } from "@/components/super-admin/dashboard/suppliers/table";
import { Card } from "@/components/ui/card";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  rows: SupplierRow[];
  onEdit: (s: SupplierRow) => void;
  onDelete: (s: SupplierRow) => void;
  onToggleStatus: (s: SupplierRow) => void;
  onViewDetails: (s: SupplierRow) => void;
  onViewHistory: (s: SupplierRow) => Promise<void>;
}

export function SuppliersTableSection({ search, onSearchChange, rows, onEdit, onDelete, onToggleStatus, onViewDetails, onViewHistory }: Props) {
  return (
    <Card className="flex flex-col">
      <SuppliersFilters search={search} onSearchChange={onSearchChange} />
      <SuppliersTable suppliers={rows} onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} onViewDetails={onViewDetails} onViewHistory={onViewHistory} />
    </Card>
  );
}
