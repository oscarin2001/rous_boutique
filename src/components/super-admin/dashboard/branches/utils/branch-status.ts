import type { BranchRow } from "@/actions/super-admin/branches/types";

export type BranchStatusVariant = "default" | "secondary" | "destructive";

export interface BranchStatusInfo {
  label: string;
  variant: BranchStatusVariant;
}

export function getBranchStatus(branch: BranchRow): BranchStatusInfo {
  const now = new Date();
  const today = now.getDay();
  const todayHours = branch.hours.find((h) => h.dayOfWeek === today);

  if (!todayHours || todayHours.isClosed) {
    return { label: "Cerrada Hoy", variant: "secondary" };
  }

  if (!todayHours.openingTime || !todayHours.closingTime) {
    return { label: "Horario Incompleto", variant: "destructive" };
  }

  if (branch.employeeCount === 0) {
    return { label: "Sin Personal", variant: "secondary" };
  }

  const [openHour, openMinute] = todayHours.openingTime.split(":").map(Number);
  const [closeHour, closeMinute] = todayHours.closingTime.split(":").map(Number);
  const openAt = new Date(now);
  openAt.setHours(openHour, openMinute, 0, 0);

  const closeAt = new Date(now);
  closeAt.setHours(closeHour, closeMinute, 0, 0);

  if (now < openAt) {
    return { label: "Abre Más Tarde", variant: "secondary" };
  }

  if (now > closeAt) {
    return { label: "Cerrada", variant: "secondary" };
  }

  return { label: "Operativa", variant: "default" };
}
