import type { ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type HeaderMetric = {
  label: string;
  value: string;
};

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  eyebrow?: string;
  metrics?: HeaderMetric[];
  actions?: ReactNode;
};

function MetricPill({ label, value }: HeaderMetric) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

export function PageHeaderCard({
  icon: Icon,
  title,
  description,
  eyebrow = "Panel",
  metrics = [],
  actions,
}: Props) {
  return (
    <header className="rounded-2xl border border-border/50 bg-card p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/20">
            <Icon className="size-5 text-foreground" />
          </div>
          <div className="space-y-2">
            <Badge variant="outline">{eyebrow}</Badge>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>

        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>

      {metrics.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricPill key={`${metric.label}-${metric.value}`} {...metric} />
          ))}
        </div>
      ) : null}
    </header>
  );
}
