"use client";

import { useEffect, useState } from "react";

import { History, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  getSuppliers,
  getSupplierMetrics,
  getSupplierOptions,
  getSupplierHistory,
  saveSupplierAction,
  deleteSupplierAction,
  toggleSupplierStatusAction,
} from "@/actions/super-admin/suppliers";
import type {
  SupplierHistoryPage,
  SupplierHistoryRow,
  SupplierRow,
  SupplierMetrics as SupplierMetricsType,
  SupplierBranchOption,
  SupplierManagerOption,
} from "@/actions/super-admin/suppliers/types";

import { SuppliersMetrics } from "@/components/super-admin/dashboard/suppliers/metrics";
import { Button } from "@/components/ui/button";

import { SuppliersPageDialogs } from "./suppliers-page-dialogs";
import { SuppliersFilters } from "../filters";
import { SuppliersTable } from "../table";
import { SuppliersTableSection } from "./suppliers-table-section";
import { SupplierAssignmentsDialog } from "../dialogs";


export function SuppliersPageContent() {
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [metrics, setMetrics] = useState<SupplierMetricsType | null>(null);
  const [search, setSearch] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRow | null>(null);
  // History dialog state
  const [historyRows, setHistoryRows] = useState<SupplierHistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoadingMore, setHistoryLoadingMore] = useState(false);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [historyNextCursor, setHistoryNextCursor] = useState<number | null>(null);
  const [historyChangedFrom, setHistoryChangedFrom] = useState("");
  const [historyChangedTo, setHistoryChangedTo] = useState("");
  const [historyLatestDays, setHistoryLatestDays] = useState<number | null>(30);
  const [options, setOptions] = useState<{ branches: SupplierBranchOption[]; managers: SupplierManagerOption[] }>({ branches: [], managers: [] });

  useEffect(() => {
    fetchData();
    fetchOptions();
    fetchMetrics();
  }, []);

  async function fetchData() {
    const data = await getSuppliers();
    setSuppliers(data);
  }

  async function fetchOptions() {
    const opts = await getSupplierOptions();
    setOptions(opts);
  }

  async function fetchMetrics() {
    const m = await getSupplierMetrics();
    setMetrics(m);
  }

  const filteredSuppliers = search.trim()
    ? suppliers.filter((s) => {
        const q = search.toLowerCase();
        return (
          s.fullName.toLowerCase().includes(q) ||
          (s.email?.toLowerCase().includes(q) ?? false) ||
          (s.city?.toLowerCase().includes(q) ?? false)
        );
      })
    : suppliers;

  // Handlers (pueden expandirse según managers)
  const openHistory = (supplier: SupplierRow) => {
    setSelectedSupplier(supplier);
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryRows([]);
    // Aquí puedes agregar fetch de historial si es necesario
    setHistoryLoading(false);
  };

  const handleToggleStatus = (supplier: SupplierRow) => {
    setSelectedSupplier(supplier);
    // Aquí puedes abrir un diálogo de confirmación si lo tienes
  };

  const handleSave = async (data: any, id?: number) => {
    setIsPending(true);
    const result = await saveSupplierAction(data, id);
    if (result.success) {
      await fetchData();
      toast.success(id ? "Proveedor actualizado" : "Proveedor creado");
      setFormOpen(false);
      setSelectedSupplier(null);
    } else {
      toast.error(result.error ?? "No se pudo guardar el proveedor");
    }
    setIsPending(false);
    return result;
  };

  const confirmDelete = async (confirmPassword: string, reason: string) => {
    if (!selectedSupplier) return;
    setIsPending(true);
    const result = await deleteSupplierAction(selectedSupplier.id, confirmPassword, reason);
    if (result.success) {
      await fetchData();
      toast.success("Proveedor eliminado correctamente");
      setDeleteOpen(false);
      setSelectedSupplier(null);
    } else {
      toast.error(result.error ?? "No se pudo eliminar");
    }
    setIsPending(false);
  };

  return (
    <>
      <div className="space-y-6">
        {metrics && <SuppliersMetrics metrics={metrics} />}
        <SuppliersFilters
          search={search}
          onSearchChange={setSearch}
          onCreate={() => {
            setSelectedSupplier(null);
            setFormOpen(true);
          }}
        />
        <SuppliersTable
          suppliers={filteredSuppliers}
          onViewDetails={(s) => {
            setSelectedSupplier(s);
            setDetailsOpen(true);
          }}
          onEdit={(s) => {
            setSelectedSupplier(s);
            setFormOpen(true);
          }}
          onManage={(s) => {
            setSelectedSupplier(s);
            setManageOpen(true);
          }}
          onHistory={openHistory}
          onToggleStatus={handleToggleStatus}
          onDelete={(s) => {
            setSelectedSupplier(s);
            setDeleteOpen(true);
          }}
        />
      </div>
      <SuppliersPageDialogs
        options={options}
        formOpen={formOpen}
        onFormOpenChange={setFormOpen}
        detailsOpen={detailsOpen}
        onDetailsOpenChange={setDetailsOpen}
        deleteOpen={deleteOpen}
        onDeleteOpenChange={setDeleteOpen}
        selectedSupplier={selectedSupplier}
        isPending={isPending}
        historyOpen={historyOpen}
        onHistoryOpenChange={setHistoryOpen}
        historyRows={historyRows}
        historyLoading={historyLoading}
        historyLoadingMore={historyLoadingMore}
        historyHasMore={historyHasMore}
        historyChangedFrom={historyChangedFrom}
        historyChangedTo={historyChangedTo}
        historyLatestDays={historyLatestDays}
        onHistoryLoadMore={() => {}}
        onHistoryChangedFromChange={setHistoryChangedFrom}
        onHistoryChangedToChange={setHistoryChangedTo}
        onHistoryLatestDaysChange={setHistoryLatestDays}
        onHistoryApplyDateRange={() => {}}
        onHistoryApplyLatest={() => {}}
        onSubmit={handleSave}
        onConfirmDelete={confirmDelete}
      />
      <SupplierAssignmentsDialog
        open={manageOpen}
        onOpenChange={(value) => {
          setManageOpen(value);
          if (!value) setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
        branchOptions={options.branches}
        managerOptions={options.managers}
        isPending={isPending}
        onSave={async (data, id) => {
          setIsPending(true);
          const result = await saveSupplierAction(data, id);
          if (result.success) {
            toast.success("Asignaciones actualizadas");
            setManageOpen(false);
            setSelectedSupplier(null);
            await fetchData();
          }
          setIsPending(false);
          return result;
        }}
      />
    </>
  );
}
