"use client";

import { Bell, Cog, ShieldAlert, User } from "lucide-react";

import { categoryLabel, type CategoryFilter } from "./notifications.types";

type Props = {
  filter: CategoryFilter;
  onFilterChange: (filter: CategoryFilter) => void;
};

const FILTERS: CategoryFilter[] = ["all", "security", "system", "account"];

const filterIcons = {
  all: Bell,
  security: ShieldAlert,
  system: Cog,
  account: User,
} as const;

function filterLabel(filter: CategoryFilter) {
  return filter === "all" ? "Todo" : categoryLabel[filter];
}

export function NotificationsControls({
  filter,
  onFilterChange,
}: Props) {
  return (
    <aside className="space-y-2 rounded-xl border border-border/60 bg-card/80 p-3 shadow-sm">
      <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Notificaciones</p>
      {FILTERS.map((item) => {
        const isActive = filter === item;
        const Icon = filterIcons[item];
        return (
          <button
            key={item}
            type="button"
            onClick={() => onFilterChange(item)}
            className={[
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm",
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            ].join(" ")}
            aria-current={isActive ? "true" : undefined}
          >
            <Icon className="size-4" />
            <span>{filterLabel(item)}</span>
          </button>
        );
      })}
    </aside>
  );
}
