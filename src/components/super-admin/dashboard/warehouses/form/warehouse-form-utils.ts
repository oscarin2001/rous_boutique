import type { WarehouseOptionBranch, WarehouseOptionManager, WarehouseRow } from "@/actions/super-admin/warehouses/types";

import type { ChangeItem, WarehouseDraft } from "./warehouse-form-types";

function normalize(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function labelFromIds(ids: number[], type: "branch" | "manager", branches: WarehouseOptionBranch[], managers: WarehouseOptionManager[]) {
  if (!ids.length) return "Sin asignacion";
  return ids
    .map((id) => (type === "branch" ? branches.find((b) => b.id === id)?.name : managers.find((m) => m.id === id)?.fullName) ?? `#${id}`)
    .join(", ");
}

export function buildWarehouseDraft(formData: FormData): WarehouseDraft {
  return {
    name: normalize(formData.get("name")),
    phone: normalize(formData.get("phone")),
    address: normalize(formData.get("address")),
    city: normalize(formData.get("city")),
    department: normalize(formData.get("department")),
    country: normalize(formData.get("country")),
    openedAt: normalize(formData.get("openedAt")),
    branchIds: formData.getAll("branchIds").map(Number).filter((id) => id > 0),
    managerIds: formData.getAll("managerIds").map(Number).filter((id) => id > 0),
  };
}

export function summarizeWarehouseChanges(row: WarehouseRow, draft: WarehouseDraft, branches: WarehouseOptionBranch[], managers: WarehouseOptionManager[]): ChangeItem[] {
  const changes: ChangeItem[] = [];
  const push = (label: string, from: string, to: string) => { if (from !== to) changes.push({ label, from: from || "Vacio", to: to || "Vacio" }); };

  push("Nombre", row.name, draft.name);
  push("Telefono", row.phone || "", draft.phone);
  push("Direccion", row.address, draft.address);
  push("Ciudad", row.city, draft.city);
  push("Departamento", row.department || "", draft.department);
  push("Pais", row.country, draft.country);
  push("Apertura", row.openedAt || "", draft.openedAt);

  const rowBranchIds = row.branches.map((b) => b.id).sort((a, b) => a - b).join(",");
  const draftBranchIds = [...draft.branchIds].sort((a, b) => a - b).join(",");
  if (rowBranchIds !== draftBranchIds) push("Sucursales", labelFromIds(row.branches.map((b) => b.id), "branch", branches, managers), labelFromIds(draft.branchIds, "branch", branches, managers));

  const rowManagerIds = row.managers.map((m) => m.id).sort((a, b) => a - b).join(",");
  const draftManagerIds = [...draft.managerIds].sort((a, b) => a - b).join(",");
  if (rowManagerIds !== draftManagerIds) push("Encargados", labelFromIds(row.managers.map((m) => m.id), "manager", branches, managers), labelFromIds(draft.managerIds, "manager", branches, managers));

  return changes;
}

