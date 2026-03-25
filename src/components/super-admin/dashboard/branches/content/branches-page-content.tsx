"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { toast } from "sonner";

import {
  configureBranchRelations,
  createBranch,
  deleteBranch,
  getBranchHistory,
  getBranchManagers,
  getBranchSuppliers,
  getBranchWarehouses,
  updateBranch,
} from "@/actions/super-admin/branches";
import type {
  BranchActionResult,
  BranchAuditEntry,
  BranchHistoryPage,
  BranchManagerOption,
  BranchMetrics,
  BranchSupplierOption,
  BranchWarehouseOption,
  BranchRow,
} from "@/actions/super-admin/branches/types";

import { BOLIVIA_COUNTRY, BOLIVIA_DEPARTMENTS } from "@/lib/bolivia";

import { BranchDeleteDialog } from "../dialogs/branch-delete-dialog";
import { BranchDetailsDialog } from "../dialogs/branch-details-dialog";
import { BranchHistoryDialog } from "../dialogs/branch-history-dialog";
import { BranchManageDialog } from "../dialogs/branch-manage-dialog";
import { BranchFilters } from "../filters/branch-filters";
import { BranchFormDialog } from "../form/branch-form-dialog";
import { BranchMetrics as Metrics } from "../metrics/branch-metrics";
import { BranchesTable } from "../table/branches-table";


interface Props {
  initialBranches: BranchRow[];
  managerOptions: BranchManagerOption[];
  warehouseOptions: BranchWarehouseOption[];
  supplierOptions: BranchSupplierOption[];
}

export function BranchesPageContent({
  initialBranches,
  managerOptions: initialManagerOptions,
  warehouseOptions: initialWarehouseOptions,
  supplierOptions: initialSupplierOptions,
}: Props) {
  const HISTORY_PAGE_SIZE = 15;
  const [branches, setBranches] = useState(initialBranches);
  const [managerOptions, setManagerOptions] = useState(initialManagerOptions);
  const [warehouseOptions, setWarehouseOptions] = useState(initialWarehouseOptions);
  const [supplierOptions, setSupplierOptions] = useState(initialSupplierOptions);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoadingMore, setHistoryLoadingMore] = useState(false);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [historyNextCursor, setHistoryNextCursor] = useState<number | null>(null);
  const [historyChangedFrom, setHistoryChangedFrom] = useState("");
  const [historyChangedTo, setHistoryChangedTo] = useState("");
  const [historyLatestDays, setHistoryLatestDays] = useState<number | null>(30);
  const [historyEntries, setHistoryEntries] = useState<BranchAuditEntry[]>([]);
  const [selected, setSelected] = useState<BranchRow | null>(null);

  useEffect(() => {
    const listener = () => {
      setSelected(null);
      setFormOpen(true);
    };
    window.addEventListener("rb:branches:create", listener);
    return () => window.removeEventListener("rb:branches:create", listener);
  }, []);

  const metrics = useMemo<BranchMetrics>(() => {
    const withEmployees = branches.filter((b) => b.employeeCount > 0).length;
    return { total: branches.length, withEmployees, withoutEmployees: branches.length - withEmployees };
  }, [branches]);

  const filtered = useMemo(() => {
    if (!search.trim()) return branches;
    const q = search.toLowerCase();
    return branches.filter((b) => [b.name, b.city, b.address].some((v) => v.toLowerCase().includes(q)));
  }, [branches, search]);

  const handleFormSubmit = (formData: FormData): Promise<BranchActionResult> =>
    new Promise((resolve) => {
      startTransition(async () => {
        const id = formData.get("id") as string | null;
        const data = parseFormData(formData);
        const result = id ? await updateBranch(Number(id), data) : await createBranch(data);

        if (result.success && result.branch) {
          setBranches((prev) =>
            id ? prev.map((b) => (b.id === result.branch!.id ? result.branch! : b)) : [...prev, result.branch!]
          );
          const nextManagers = await getBranchManagers();
          setManagerOptions(nextManagers);
          toast.success(id ? "Sucursal actualizada correctamente" : "Sucursal creada correctamente");
          setFormOpen(false);
          setSelected(null);
        } else if (!result.fieldErrors) {
          toast.error(result.error ?? "No se pudo guardar la sucursal");
        }

        resolve(result);
      });
    });

  const handleDelete = (confirmPassword: string) => {
    if (!selected) return;
    startTransition(async () => {
      const result = await deleteBranch(selected.id, confirmPassword);
      if (result.success) {
        setBranches((prev) => prev.filter((b) => b.id !== selected.id));
        toast.success("Sucursal eliminada correctamente");
      } else {
        toast.error(result.error ?? "Error al eliminar");
      }
      setDeleteOpen(false);
      setSelected(null);
    });
  };

  const handleManageSave = (payload: {
    managerIds: number[];
    warehouseIds: number[];
    supplierIds: number[];
    confirmPassword: string;
  }): Promise<BranchActionResult> =>
    new Promise((resolve) => {
      if (!selected) {
        resolve({ success: false, error: "Sucursal no seleccionada" });
        return;
      }
      startTransition(async () => {
        const result = await configureBranchRelations(selected.id, payload);
        if (result.success && result.branch) {
          setBranches((prev) => prev.map((branch) => (branch.id === result.branch!.id ? result.branch! : branch)));
          const [nextManagers, nextWarehouses, nextSuppliers] = await Promise.all([
            getBranchManagers(),
            getBranchWarehouses(),
            getBranchSuppliers(),
          ]);
          setManagerOptions(nextManagers);
          setWarehouseOptions(nextWarehouses);
          setSupplierOptions(nextSuppliers);
          setSelected(result.branch);
          toast.success("Configuraci�n de sucursal actualizada");
        } else {
          toast.error(result.error ?? "No se pudo guardar la configuraci�n");
        }
        resolve(result);
      });
    });

  const loadBranchHistory = async (branchId: number, reset: boolean, latestDaysOverride?: number | null) => {
    const page: BranchHistoryPage = await getBranchHistory(branchId, {
      cursor: reset ? null : historyNextCursor,
      limit: HISTORY_PAGE_SIZE,
      changedFrom: historyChangedFrom || null,
      changedTo: historyChangedTo || null,
      latestDays: latestDaysOverride !== undefined ? latestDaysOverride : historyLatestDays,
    });

    setHistoryEntries((prev) => (reset ? page.entries : [...prev, ...page.entries]));
    setHistoryHasMore(page.hasMore);
    setHistoryNextCursor(page.nextCursor);
  };

  const handleOpenHistory = (branch: BranchRow) => {
    setSelected(branch);
    setHistoryOpen(true);
    setHistoryLoading(true);
    startTransition(async () => {
      setHistoryEntries([]);
      setHistoryHasMore(false);
      setHistoryNextCursor(null);
      await loadBranchHistory(branch.id, true);
      setHistoryLoading(false);
    });
  };

  const handleLoadMoreHistory = () => {
    if (!selected || !historyHasMore || !historyNextCursor || historyLoadingMore) return;
    setHistoryLoadingMore(true);
    startTransition(async () => {
      await loadBranchHistory(selected.id, false);
      setHistoryLoadingMore(false);
    });
  };

  const handleApplyLatestHistory = (days: number | null) => {
    if (!selected) return;
    setHistoryLatestDays(days);
    setHistoryLoading(true);
    startTransition(async () => {
      setHistoryEntries([]);
      setHistoryHasMore(false);
      setHistoryNextCursor(null);
      await loadBranchHistory(selected.id, true, days);
      setHistoryLoading(false);
    });
  };

  const handleApplyHistoryDateRange = () => {
    if (!selected) return;
    setHistoryLatestDays(null);
    setHistoryLoading(true);
    startTransition(async () => {
      setHistoryEntries([]);
      setHistoryHasMore(false);
      setHistoryNextCursor(null);
      await loadBranchHistory(selected.id, true, null);
      setHistoryLoading(false);
    });
  };

  return (
    <div className="space-y-6">
      <Metrics metrics={metrics} />
      <BranchFilters search={search} onSearchChange={setSearch} onCreate={() => { setSelected(null); setFormOpen(true); }} />
      <BranchesTable
        branches={filtered}
        onView={(b) => { setSelected(b); setDetailsOpen(true); }}
        onEdit={(b) => { setSelected(b); setFormOpen(true); }}
        onManage={(b) => { setSelected(b); setManageOpen(true); }}
        onHistory={handleOpenHistory}
        onDelete={(b) => { setSelected(b); setDeleteOpen(true); }}
      />
      <BranchFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setSelected(null);
        }}
        branch={selected}
        managerOptions={managerOptions}
        onSubmit={handleFormSubmit}
        isPending={isPending}
      />
      <BranchDetailsDialog branch={selected} open={detailsOpen} onOpenChange={(v) => { setDetailsOpen(v); if (!v) setSelected(null); }} />
      <BranchManageDialog
        branch={selected}
        open={manageOpen}
        onOpenChange={(v) => {
          setManageOpen(v);
          if (!v) setSelected(null);
        }}
        managerOptions={managerOptions}
        warehouseOptions={warehouseOptions}
        supplierOptions={supplierOptions}
        onSave={handleManageSave}
        isPending={isPending}
      />
      <BranchHistoryDialog
        open={historyOpen}
        onOpenChange={(v) => {
          setHistoryOpen(v);
          if (!v) {
            setSelected(null);
            setHistoryEntries([]);
            setHistoryLoading(false);
            setHistoryLoadingMore(false);
            setHistoryHasMore(false);
            setHistoryNextCursor(null);
          }
        }}
        entries={historyEntries}
        isLoading={historyLoading}
        hasMore={historyHasMore}
        isLoadingMore={historyLoadingMore}
        changedFrom={historyChangedFrom}
        changedTo={historyChangedTo}
        latestDays={historyLatestDays}
        onLoadMore={handleLoadMoreHistory}
        onChangedFromChange={setHistoryChangedFrom}
        onChangedToChange={setHistoryChangedTo}
        onLatestDaysChange={setHistoryLatestDays}
        onApplyDateRange={handleApplyHistoryDateRange}
        onApplyLatest={handleApplyLatestHistory}
      />
      <BranchDeleteDialog branch={selected} open={deleteOpen} onOpenChange={(v) => { setDeleteOpen(v); if (!v) setSelected(null); }} onConfirm={handleDelete} isPending={isPending} />
    </div>
  );
}

function parseFormData(formData: FormData) {
  const openedAt = ((formData.get("openedAt") as string) || "").trim();
  const normalize = (value: string) => value.replace(/[\n\r]/g, " ").trim();
  const phone = ((formData.get("phone") as string) || "").replace(/\D/g, "").slice(0, 8);
  const googleMaps = normalize((formData.get("googleMaps") as string) || "");
  const rawDepartment = normalize(formData.get("department") as string);
  const rawManagerId = ((formData.get("managerId") as string) || "").trim();
  const confirmPassword = ((formData.get("confirmPassword") as string) || "").trim();
  const department = BOLIVIA_DEPARTMENTS.includes(rawDepartment as (typeof BOLIVIA_DEPARTMENTS)[number])
    ? (rawDepartment as (typeof BOLIVIA_DEPARTMENTS)[number])
    : BOLIVIA_DEPARTMENTS[0];

  return {
    name: normalize(formData.get("name") as string),
    nit: normalize((formData.get("nit") as string) || ""),
    phone,
    address: normalize(formData.get("address") as string).slice(0, 120),
    city: normalize(formData.get("city") as string).slice(0, 50),
    department,
    country: BOLIVIA_COUNTRY,
    googleMaps,
    managerId: /^\d+$/.test(rawManagerId) ? Number(rawManagerId) : null,
    confirmPassword,
    openedAt,
  };
}


