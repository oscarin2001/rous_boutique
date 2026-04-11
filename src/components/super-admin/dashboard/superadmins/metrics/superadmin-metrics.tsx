import type { SuperAdminRow } from "@/actions/super-admin/superadmins/types";

type Props = {
  superAdmins: SuperAdminRow[];
};

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function SuperAdminMetrics({ superAdmins }: Props) {
  const active = superAdmins.filter((item) => item.status === "ACTIVE").length;
  const deactivated = superAdmins.filter((item) => item.status === "DEACTIVATED").length;
  const inactive = superAdmins.filter((item) => item.status === "INACTIVE").length;

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <MetricCard label="Total super admins" value={superAdmins.length} />
      <MetricCard label="Activos" value={active} />
      <MetricCard label="Desactivados" value={deactivated} />
      <MetricCard label="Inactivos" value={inactive} />
    </div>
  );
}
