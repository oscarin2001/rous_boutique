export type NotificationItem = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  actorName: string;
  category: "security" | "system" | "account";
  showExactTimestamp: boolean;
  lastConnectionAt: string | null;
  isRead: boolean;
};

export type CategoryFilter = "all" | "security" | "system" | "account";

export const categoryLabel: Record<Exclude<CategoryFilter, "all">, string> = {
  security: "Seguridad",
  system: "Sistema",
  account: "Cuenta",
};
