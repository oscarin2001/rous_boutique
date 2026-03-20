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
  SupplierHistoryRow,
  SupplierRow,
  SupplierMetrics as SupplierMetricsType,
  SupplierBranchOption,
  SupplierManagerOption,
} from "@/actions/super-admin/suppliers/types";

import { SuppliersMetrics } from "@/components/super-admin/dashboard/suppliers/metrics";
import { Button } from "@/components/ui/button";

import { SuppliersPageDialogs } from "./suppliers-page-dialogs";
import { SuppliersTableSection } from "./suppliers-table-section";


export function SuppliersPageContent() {
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [metrics, setMetrics] = useState<SupplierMetricsType | null>(null);
  const [options, setOptions] = useState<{ branches: SupplierBranchOption[]; managers: SupplierManagerOption[] }>({ branches: [], managers: [] });
  const [search, setSearch] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRows, setHistoryRows] = useState<SupplierHistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchData = async () => {
    const [s, m, o] = await Promise.all([
      getSuppliers(),
      getSupplierMetrics(),
      getSupplierOptions(),
    ]);
    setSuppliers(s);
    setMetrics(m);
    setOptions(o);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (data: Record<string, unknown>, id?: number) => {
    setIsPending(true);
    const res = await saveSupplierAction(data, id);
    if (res.success) {
      toast.success(id ? "Proveedor actualizado" : "Proveedor creado");
      setFormOpen(false);
      fetchData();
    }
    setIsPending(false);
    return res;
  };
  const confirmDelete = async (password: string) => {
    if (!selectedSupplier) return;
    setIsPending(true);
    const res = await deleteSupplierAction(selectedSupplier.id, password);
    if (res.success) {
      toast.success("Proveedor eliminado");
      setDeleteOpen(false);
      setSelectedSupplier(null);
      fetchData();
    } else {
      toast.error(res.error || "No se pudo eliminar");
    }
    setIsPending(false);
  };
  const handleToggleStatus = async (s: SupplierRow) => {
    const res = await toggleSupplierStatusAction(s.id, s.isActive);
    if (res.success) {
      toast.success("Estado actualizado");
      fetchData();
    } else {
      toast.error(res.error || "Error al actualizar estado");
    }
  };
  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.city?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proveedores</h1>
          <p className="text-muted-foreground">Gestiona tus aliados comerciales y suministros de sucursales.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("Historial global en desarrollo")}>
            <History className="mr-2 size-4" /> Historial
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setSelectedSupplier(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" /> Nuevo Proveedor
          </Button>
        </div>
      </div>
      {metrics && <SuppliersMetrics metrics={metrics} />}
      <SuppliersTableSection
        search={search}
        onSearchChange={setSearch}
        rows={filteredSuppliers}
        onEdit={(s) => {
          setSelectedSupplier(s);
          setFormOpen(true);
        }}
        onDelete={(s) => {
          setSelectedSupplier(s);
          setDeleteOpen(true);
        }}
        onToggleStatus={handleToggleStatus}
        onViewDetails={(s) => {
          setSelectedSupplier(s);
          setDetailsOpen(true);
        }}
        onViewHistory={async (s) => {
          setSelectedSupplier(s);
          setHistoryOpen(true);
          setHistoryLoading(true);
          const rows = await getSupplierHistory(s.id);
          setHistoryRows(rows);
          setHistoryLoading(false);
        }}
      />
      <SuppliersPageDialogs
        selectedSupplier={selectedSupplier}
        options={options}
        formOpen={formOpen}
        deleteOpen={deleteOpen}
        detailsOpen={detailsOpen}
        historyOpen={historyOpen}
        historyRows={historyRows}
        historyLoading={historyLoading}
        isPending={isPending}
        onFormOpenChange={setFormOpen}
        onDeleteOpenChange={setDeleteOpen}
        onDetailsOpenChange={(value) => {
          setDetailsOpen(value);
          if (!value) setSelectedSupplier(null);
        }}
        onHistoryOpenChange={(value) => {
          setHistoryOpen(value);
          if (!value) {
            setSelectedSupplier(null);
            setHistoryRows([]);
          }
        }}
        onSubmit={handleSave}
        onConfirmDelete={confirmDelete}
      />
    </div>
  );
}
