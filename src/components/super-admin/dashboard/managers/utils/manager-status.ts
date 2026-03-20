import type { ManagerStatus } from "@/actions/super-admin/managers/types";

export type ManagerStatusVariant = "default" | "secondary" | "destructive";

export function getManagerStatusInfo(status: ManagerStatus): {
  label: string;
  variant: ManagerStatusVariant;
} {
  if (status === "ACTIVE") return { label: "Activo", variant: "default" };
  if (status === "DEACTIVATED") return { label: "Desactivado", variant: "destructive" };
  return { label: "Inactivo", variant: "secondary" };
}

