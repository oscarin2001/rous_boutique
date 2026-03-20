"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { toast } from "sonner";

import {
  createManager,
  deleteManager,
  getManagerBranchOptions,
  getManagerHistory,
  toggleManagerStatus,
  updateManager,
} from "@/actions/super-admin/managers";
import type {
  ManagerActionResult,
  ManagerAuditEntry,
  ManagerBranchOption,
  ManagerMetrics,
  ManagerRow,
} from "@/actions/super-admin/managers/types";

import { ManagerAssignmentsDialog } from "../dialogs/manager-assignments-dialog";
import { ManagerDeleteDialog } from "../dialogs/manager-delete-dialog";
import { ManagerDetailsDialog } from "../dialogs/manager-details-dialog";
import { ManagerHistoryDialog } from "../dialogs/manager-history-dialog";
import { ManagersFilters } from "../filters/managers-filters";
import { ManagerFormDialog } from "../form/manager-form-dialog";
import { ManagersMetrics } from "../metrics/managers-metrics";
import { ManagersTable } from "../table/managers-table";

interface Props {
  initialManagers: ManagerRow[];
  branchOptions: ManagerBranchOption[];
}

export function ManagersPageContent({ initialManagers, branchOptions: initialBranchOptions }: Props) {
  const [managers, setManagers] = useState(initialManagers);
  const [branchOptions, setBranchOptions] = useState(initialBranchOptions);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<ManagerAuditEntry[]>([]);
  const [selected, setSelected] = useState<ManagerRow | null>(null);

  useEffect(() => {
    const listener = () => {
      setSelected(null);
      setFormOpen(true);
    };

    window.addEventListener("rb:managers:create", listener);
    return () => window.removeEventListener("rb:managers:create", listener);
  }, []);

  const metrics = useMemo<ManagerMetrics>(() => {
    const total = managers.length;
    const active = managers.filter((manager) => manager.status === "ACTIVE").length;
    const deactivated = managers.filter((manager) => manager.status === "DEACTIVATED").length;
    const inactive = managers.filter((manager) => manager.status === "INACTIVE").length;
    const withBranches = managers.filter((manager) => manager.branches.length > 0).length;

    return {
      total,
      active,
      deactivated,
      inactive,
      withBranches,
      withoutBranches: total - withBranches,
    };
  }, [managers]);

  const filteredManagers = useMemo(() => {
    if (!search.trim()) return managers;
    const query = search.toLowerCase();

    return managers.filter((manager) =>
      [manager.fullName, manager.email, manager.ci, manager.phone ?? "", ...manager.branches.map((branch) => branch.name)]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [managers, search]);

  const refreshBranchOptions = async () => {
    const nextOptions = await getManagerBranchOptions();
    setBranchOptions(nextOptions);
  };

  const handleFormSubmit = (data: Record<string, unknown>, id?: number): Promise<ManagerActionResult> =>
    new Promise((resolve) => {
      startTransition(async () => {
        const result = id ? await updateManager(id, data) : await createManager(data);

        if (result.success && result.manager) {
          setManagers((prev) =>
            id
              ? prev.map((item) => (item.id === result.manager!.id ? result.manager! : item))
              : [result.manager!, ...prev]
          );

          await refreshBranchOptions();
          toast.success(id ? "Encargado actualizado correctamente" : "Encargado creado correctamente");
          setFormOpen(false);
          setSelected(null);
        } else if (!result.fieldErrors) {
          toast.error(result.error ?? "No se pudo guardar el encargado");
        }

        resolve(result);
      });
    });

  const handleDelete = (confirmPassword: string) => {
    if (!selected) return;

    startTransition(async () => {
      const result = await deleteManager(selected.id, confirmPassword);
      if (result.success) {
        setManagers((prev) => prev.filter((manager) => manager.id !== selected.id));
        await refreshBranchOptions();
        toast.success("Encargado eliminado correctamente");
      } else {
        toast.error(result.error ?? "No se pudo eliminar");
      }

      setDeleteOpen(false);
      setSelected(null);
    });
  };

  const handleToggleStatus = (manager: ManagerRow) => {
    startTransition(async () => {
      const result = await toggleManagerStatus(manager.id);
      if (result.success && result.manager) {
        setManagers((prev) => prev.map((item) => (item.id === result.manager!.id ? result.manager! : item)));
        toast.success(result.manager.status === "ACTIVE" ? "Encargado activado" : "Encargado desactivado");
      } else {
        toast.error(result.error ?? "No se pudo actualizar el estado");
      }
    });
  };

  const handleOpenHistory = (manager: ManagerRow) => {
    setSelected(manager);
    setHistoryOpen(true);
    setHistoryLoading(true);

    startTransition(async () => {
      const entries = await getManagerHistory(manager.id);
      setHistoryEntries(entries);
      setHistoryLoading(false);
    });
  };

  return (
    <div className="space-y-6">
      <ManagersMetrics metrics={metrics} />

      <ManagersFilters
        search={search}
        onSearchChange={setSearch}
        onCreate={() => {
          setSelected(null);
          setFormOpen(true);
        }}
      />

      <ManagersTable
        managers={filteredManagers}
        onView={(manager) => {
          setSelected(manager);
          setDetailsOpen(true);
        }}
        onEdit={(manager) => {
          setSelected(manager);
          setFormOpen(true);
        }}
        onManage={(manager) => {
          setSelected(manager);
          setManageOpen(true);
        }}
        onHistory={handleOpenHistory}
        onToggleStatus={handleToggleStatus}
        onDelete={(manager) => {
          setSelected(manager);
          setDeleteOpen(true);
        }}
      />

      <ManagerFormDialog
        open={formOpen}
        onOpenChange={(value) => {
          setFormOpen(value);
          if (!value) setSelected(null);
        }}
        manager={selected}
        branchOptions={branchOptions}
        onSubmit={handleFormSubmit}
        isPending={isPending}
      />

      <ManagerDetailsDialog
        manager={selected}
        open={detailsOpen}
        onOpenChange={(value) => {
          setDetailsOpen(value);
          if (!value) setSelected(null);
        }}
      />

      <ManagerAssignmentsDialog
        open={manageOpen}
        onOpenChange={(value) => {
          setManageOpen(value);
          if (!value) setSelected(null);
        }}
        manager={selected}
        branchOptions={branchOptions}
        isPending={isPending}
        onSave={(data, id) =>
          new Promise((resolve) => {
            startTransition(async () => {
              const result = await updateManager(id, data);
              if (result.success && result.manager) {
                setManagers((prev) => prev.map((item) => (item.id === result.manager!.id ? result.manager! : item)));
                await refreshBranchOptions();
                toast.success("Asignaciones actualizadas");
                setManageOpen(false);
                setSelected(null);
              } else if (!result.fieldErrors) {
                toast.error(result.error ?? "No se pudieron guardar asignaciones");
              }
              resolve(result);
            });
          })
        }
      />

      <ManagerHistoryDialog
        open={historyOpen}
        onOpenChange={(value) => {
          setHistoryOpen(value);
          if (!value) {
            setSelected(null);
            setHistoryEntries([]);
            setHistoryLoading(false);
          }
        }}
        entries={historyEntries}
        isLoading={historyLoading}
      />

      <ManagerDeleteDialog
        manager={selected}
        open={deleteOpen}
        onOpenChange={(value) => {
          setDeleteOpen(value);
          if (!value) setSelected(null);
        }}
        onConfirm={handleDelete}
        isPending={isPending}
      />
    </div>
  );
}

