import type { SupplierRow } from "@/actions/super-admin/suppliers/types";

import { SuppliersFilters } from "@/components/super-admin/dashboard/suppliers/filters";
import { SuppliersTable } from "@/components/super-admin/dashboard/suppliers/table";
import { Card } from "@/components/ui/card";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
  rows: SupplierRow[];
  onEdit: (s: SupplierRow) => void;
  onHistory: (s: SupplierRow) => void;
  onManage: (s: SupplierRow) => void;
  onDelete: (s: SupplierRow) => void;
  onToggleStatus: (s: SupplierRow) => void;
  onViewDetails: (s: SupplierRow) => void;
}

export function SuppliersTableSection({ search, onSearchChange, onCreate, rows, onEdit, onHistory, onManage, onDelete, onToggleStatus, onViewDetails }: Props) {
  return (
    <Card className="flex flex-col">
      <SuppliersFilters search={search} onSearchChange={onSearchChange} onCreate={onCreate} />
      <SuppliersTable suppliers={rows} onEdit={onEdit} onHistory={onHistory} onManage={onManage} onDelete={onDelete} onToggleStatus={onToggleStatus} onViewDetails={onViewDetails} />
    </Card>
  );
}
