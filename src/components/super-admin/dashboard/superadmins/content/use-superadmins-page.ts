"use client";
import { useMemo, useState, useTransition } from "react";

import { toast } from "sonner";

import {
  createSuperAdmin,
  deleteSuperAdmin,
  toggleSuperAdminStatus,
  updateSuperAdmin,
} from "@/actions/super-admin/superadmins/mutations";
import { getSuperAdminHistory } from "@/actions/super-admin/superadmins/queries";
import type {
  SuperAdminActionResult,
  SuperAdminAuditEntry,
  SuperAdminRow,
} from "@/actions/super-admin/superadmins/types";

function byNewest(a: SuperAdminRow, b: SuperAdminRow) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function useSuperAdminsPage(initialSuperAdmins: SuperAdminRow[]) {
  const [superAdmins, setSuperAdmins] = useState(initialSuperAdmins);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SuperAdminRow | null>(null);
  const [historyEntries, setHistoryEntries] = useState<SuperAdminAuditEntry[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [...superAdmins].sort(byNewest);
    return superAdmins
      .filter((row) =>
        [row.fullName, row.username, row.ci, row.phone ?? ""].join(" ").toLowerCase().includes(query),
      )
      .sort(byNewest);
  }, [superAdmins, search]);

  const runWithTransition = <T,>(task: () => Promise<T>) =>
    new Promise<T>((resolve) => {
      startTransition(async () => {
        resolve(await task());
      });
    });

  const handleCreate = (payload: Record<string, unknown>) =>
    runWithTransition(async () => {
      const result = await createSuperAdmin(payload);
      if (result.success && result.superAdmin) {
        setSuperAdmins((prev) => [result.superAdmin!, ...prev]);
        toast.success("Super admin creado");
      } else if (!result.fieldErrors) {
        toast.error(result.error ?? "No se pudo crear");
      }
      return result;
    });

  const handleUpdate = (id: number, payload: Record<string, unknown>): Promise<SuperAdminActionResult> =>
    runWithTransition(async () => {
      const result = await updateSuperAdmin(id, payload);
      if (result.success && result.superAdmin) {
        setSuperAdmins((prev) => prev.map((row) => (row.id === id ? result.superAdmin! : row)));
        toast.success("Super admin actualizado");
      } else if (!result.fieldErrors) {
        toast.error(result.error ?? "No se pudo actualizar");
      }
      return result;
    });

  const handleOpenHistory = (row: SuperAdminRow) => {
    setSelected(row);
    setHistoryEntries([]);
    setHistoryOpen(true);
    startTransition(async () => {
      const entries = await getSuperAdminHistory(row.id);
      setHistoryEntries(entries);
    });
  };

  const handleConfirmStatus = (payload: { adminConfirmPassword: string; statusReason: string }) => {
    if (!selected) return;
    setStatusError(null);
    startTransition(async () => {
      const result = await toggleSuperAdminStatus(selected.id, payload);
      if (result.success && result.superAdmin) {
        setSuperAdmins((prev) => prev.map((row) => (row.id === selected.id ? result.superAdmin! : row)));
        setStatusOpen(false);
        setSelected(null);
        toast.success("Estado actualizado");
        return;
      }
      const message = result.fieldErrors?.adminConfirmPassword ?? result.error ?? "No se pudo actualizar estado";
      setStatusError(message);
    });
  };

  const handleConfirmDelete = (payload: { adminConfirmPassword: string }) => {
    if (!selected) return;
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteSuperAdmin(selected.id, payload);
      if (result.success) {
        setSuperAdmins((prev) => prev.filter((row) => row.id !== selected.id));
        setDeleteOpen(false);
        setSelected(null);
        toast.success("Super admin eliminado");
        return;
      }
      const message = result.fieldErrors?.adminConfirmPassword ?? result.error ?? "No se pudo eliminar";
      setDeleteError(message);
    });
  };

  return {
    superAdmins,
    filtered,
    search,
    setSearch,
    selected,
    setSelected,
    historyEntries,
    setHistoryEntries,
    formOpen,
    setFormOpen,
    detailsOpen,
    setDetailsOpen,
    historyOpen,
    setHistoryOpen,
    statusOpen,
    setStatusOpen,
    deleteOpen,
    setDeleteOpen,
    statusError,
    setStatusError,
    deleteError,
    setDeleteError,
    isPending,
    handleCreate,
    handleUpdate,
    handleOpenHistory,
    handleConfirmStatus,
    handleConfirmDelete,
  };
}
