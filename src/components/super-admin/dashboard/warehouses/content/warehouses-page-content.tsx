"use client";

import { useMemo, useState, useTransition } from "react";

import { toast } from "sonner";

import { createWarehouse, deleteWarehouse, getWarehouseHistory, updateWarehouse } from "@/actions/super-admin/warehouses";
import type { WarehouseHistoryRow, WarehouseMetrics, WarehouseOptionBranch, WarehouseOptionManager, WarehouseRow } from "@/actions/super-admin/warehouses/types";

import { WarehouseDeleteDialog } from "../dialogs/warehouse-delete-dialog";
import { WarehouseDetailsDialog } from "../dialogs/warehouse-details-dialog";
import { WarehouseHistoryDialog } from "../dialogs/warehouse-history-dialog";
import { WarehousesFilters } from "../filters/warehouses-filters";
import { WarehouseFormDialog } from "../form/warehouse-form-dialog";
import { WarehousesMetrics } from "../metrics/warehouses-metrics";
import { WarehousesTable } from "../table/warehouses-table";

interface Props {
  initialRows: WarehouseRow[];
  options: { branches: WarehouseOptionBranch[]; managers: WarehouseOptionManager[] };
}

export function WarehousesPageContent({ initialRows, options }: Props) {
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<WarehouseRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [historyRows, setHistoryRows] = useState<WarehouseHistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const metrics = useMemo<WarehouseMetrics>(() => {
    const total = rows.length;
    const withManagers = rows.filter((r) => r.managers.length > 0).length;
    const withBranches = rows.filter((r) => r.branches.length > 0).length;
    return { total, withManagers, withoutManagers: total - withManagers, withBranches, withoutBranches: total - withBranches };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => [r.name, r.address, r.city, ...r.managers.map((m) => m.fullName)].join(" ").toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <div className="space-y-6">
      <WarehousesMetrics metrics={metrics} />
      <WarehousesFilters search={search} onSearchChange={setSearch} onCreate={() => { setSelected(null); setFormOpen(true); }} />
      <WarehousesTable rows={filtered} onView={(r) => { setSelected(r); setDetailsOpen(true); }} onEdit={(r) => { setSelected(r); setFormOpen(true); }} onHistory={(r) => { setSelected(r); setHistoryOpen(true); setHistoryLoading(true); startTransition(async () => { setHistoryRows(await getWarehouseHistory(r.id)); setHistoryLoading(false); }); }} onDelete={(r) => { setSelected(r); setDeleteOpen(true); }} />

      <WarehouseFormDialog open={formOpen} onOpenChange={setFormOpen} row={selected} branches={options.branches} managers={options.managers} isPending={isPending} onSubmit={(data, id) => new Promise((resolve) => { startTransition(async () => { const result = id ? await updateWarehouse(id, data) : await createWarehouse(data); if (result.success && result.warehouse) { setRows((prev) => (id ? prev.map((p) => (p.id === result.warehouse!.id ? result.warehouse! : p)) : [result.warehouse!, ...prev])); setFormOpen(false); setSelected(null); toast.success(id ? "Bodega actualizada" : "Bodega creada"); } else if (!result.fieldErrors) toast.error(result.error || "No se pudo guardar"); resolve(result); }); })} />

      <WarehouseDetailsDialog row={selected} open={detailsOpen} onOpenChange={setDetailsOpen} />
      <WarehouseHistoryDialog open={historyOpen} onOpenChange={(v) => { setHistoryOpen(v); if (!v) setHistoryRows([]); }} loading={historyLoading} rows={historyRows} />
      <WarehouseDeleteDialog row={selected} open={deleteOpen} onOpenChange={setDeleteOpen} isPending={isPending} onConfirm={(password) => startTransition(async () => { if (!selected) return; const result = await deleteWarehouse(selected.id, password); if (result.success) { setRows((prev) => prev.filter((p) => p.id !== selected.id)); setDeleteOpen(false); setSelected(null); toast.success("Bodega eliminada"); } else toast.error(result.error || "No se pudo eliminar"); })} />
    </div>
  );
}

