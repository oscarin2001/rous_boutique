import { Building2, Users, UserX } from "lucide-react";

import type { BranchMetrics as Metrics } from "@/actions/super-admin/branches/types";

import { Card, CardContent } from "@/components/ui/card";

const cards = [
  {
    key: "total",
    label: "Total Sucursales",
    icon: Building2,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    key: "withEmployees",
    label: "Con Empleados",
    icon: Users,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    key: "withoutEmployees",
    label: "Sin Empleados",
    icon: UserX,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
] as const;

export function BranchMetrics({ metrics }: { metrics: Metrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.key}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg p-2.5 ${c.bg}`}>
                <Icon className={`size-5 ${c.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold">
                  {metrics[c.key as keyof Metrics]}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

