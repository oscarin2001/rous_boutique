import type {
  SupplierBranchOption,
  SupplierManagerOption,
  SupplierRow,
} from "@/actions/super-admin/suppliers/types";

import type { ChangeItem, SupplierDraft } from "./supplier-form-types";

function normalize(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export function buildDraft(formData: FormData): SupplierDraft {
  const branchIds = formData.getAll("branchIds").map(Number).filter((id) => id > 0);
  const managerIds = formData.getAll("managerIds").map(Number).filter((id) => id > 0);

  return {
    firstName: normalize(formData.get("firstName")),
    lastName: normalize(formData.get("lastName")),
    phone: normalize(formData.get("phone")),
    email: normalize(formData.get("email")),
    address: normalize(formData.get("address")),
    city: normalize(formData.get("city")),
    department: normalize(formData.get("department")),
    country: normalize(formData.get("country")),
    ci: normalize(formData.get("ci")),
    notes: normalize(formData.get("notes")),
    birthDate: normalize(formData.get("birthDate")),
    partnerSince: normalize(formData.get("partnerSince")),
    contractEndAt: normalize(formData.get("contractEndAt")),
    isIndefinite: String(formData.get("isIndefinite") ?? "") === "on",
    branchIds,
    managerIds,
  };
}

export function summarizeChanges(
  original: SupplierRow,
  draft: SupplierDraft,
  branchOptions: SupplierBranchOption[],
  managerOptions: SupplierManagerOption[]
): ChangeItem[] {
  const changes: ChangeItem[] = [];
  const addIfChanged = (label: string, from: string | null, to: string) => {
    if ((from ?? "") !== to) changes.push({ label, from: from || "Vacio", to: to || "Vacio" });
  };

  addIfChanged("Nombre", original.firstName, draft.firstName);
  addIfChanged("Apellido", original.lastName, draft.lastName);
  addIfChanged("Telefono", original.phone, draft.phone);
  addIfChanged("Correo", original.email, draft.email);
  addIfChanged("CI", original.ci, draft.ci);
  addIfChanged("Fin de contrato", original.contractEndAt, draft.contractEndAt);
  if (original.isIndefinite !== draft.isIndefinite) {
    changes.push({
      label: "Contrato indefinido",
      from: original.isIndefinite ? "Si" : "No",
      to: draft.isIndefinite ? "Si" : "No",
    });
  }

  const fromBranchIds = original.branches.map((b) => b.id).sort().join(",");
  const toBranchIds = [...draft.branchIds].sort().join(",");
  if (fromBranchIds !== toBranchIds) {
    const toNames = draft.branchIds
      .map((id) => branchOptions.find((b) => b.id === id)?.name)
      .filter(Boolean)
      .join(", ");
    changes.push({
      label: "Sucursales",
      from: original.branches.map((b) => b.name).join(", ") || "Ninguna",
      to: toNames || "Ninguna",
    });
  }
  // Assignments (branches/managers) are managed outside the modal now; omit from change summary

  return changes;
}

