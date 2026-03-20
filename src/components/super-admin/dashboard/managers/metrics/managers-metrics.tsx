import { Users, UserCheck, UserX, Building2 } from "lucide-react";

import type { ManagerMetrics } from "@/actions/super-admin/managers/types";

import { Card, CardContent } from "@/components/ui/card";

const cards = [
  { key: "total", label: "Total Encargados de sucursal", icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { key: "active", label: "Activos", icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { key: "deactivated", label: "Desactivados", icon: UserX, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { key: "withBranches", label: "Con Sucursales", icon: Building2, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
] as const;

export function ManagersMetrics({ metrics }: { metrics: ManagerMetrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg p-2.5 ${card.bg}`}>
                <Icon className={`size-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold">{metrics[card.key]}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

