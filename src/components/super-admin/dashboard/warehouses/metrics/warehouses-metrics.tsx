import { Boxes, Building2, UserCog, UsersRound } from "lucide-react";

import type { WarehouseMetrics } from "@/actions/super-admin/warehouses/types";

interface Props {
  metrics: WarehouseMetrics;
}

function MetricCard({ title, value, icon: Icon }: { title: string; value: number; icon: typeof Boxes }) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function WarehousesMetrics({ metrics }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard title="Total Bodegas" value={metrics.total} icon={Boxes} />
      <MetricCard title="Con Encargado" value={metrics.withManagers} icon={UserCog} />
      <MetricCard title="Sin Encargado" value={metrics.withoutManagers} icon={UsersRound} />
      <MetricCard title="Con Sucursal" value={metrics.withBranches} icon={Building2} />
    </div>
  );
}

