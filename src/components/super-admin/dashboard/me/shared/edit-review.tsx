import { CheckCircle2, FilePenLine } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export type ReviewChangeItem = {
  label: string;
  previous: string;
  next: string;
};

type EditStepsHeaderProps = {
  currentStep: 1 | 2;
  firstTitle?: string;
  firstDescription?: string;
  secondTitle?: string;
  secondDescription?: string;
};

type ReviewChangesPanelProps = {
  title: string;
  description: string;
  changes: ReviewChangeItem[];
};

function StepCard({
  stepNumber,
  title,
  description,
  active,
  completed,
}: {
  stepNumber: 1 | 2;
  title: string;
  description: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl border p-4 transition-colors",
        active || completed
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-border/50 bg-muted/20",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Paso {stepNumber}</Badge>
            <p className="text-sm font-semibold">{title}</p>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-full border border-border/50 p-2">
          {completed ? (
            <CheckCircle2 className="size-4 text-emerald-600" />
          ) : (
            <FilePenLine className="size-4 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}

export function EditStepsHeader({
  currentStep,
  firstTitle = "Editar informacion",
  firstDescription = "Completa los datos y valida el formato antes de continuar.",
  secondTitle = "Revisar cambios",
  secondDescription = "Verifica el resumen y luego confirma la operacion desde el modal.",
}: EditStepsHeaderProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <StepCard
        stepNumber={1}
        title={firstTitle}
        description={firstDescription}
        active={currentStep === 1}
        completed={currentStep === 2}
      />
      <StepCard
        stepNumber={2}
        title={secondTitle}
        description={secondDescription}
        active={currentStep === 2}
        completed={false}
      />
    </div>
  );
}

export function ReviewChangesPanel({
  title,
  description,
  changes,
}: ReviewChangesPanelProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-border/50 bg-muted/20 p-5">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-3">
        {changes.map((change) => (
          <article key={`${change.label}-${change.previous}-${change.next}`} className="rounded-xl border border-border/50 bg-card p-4">
            <p className="text-sm font-semibold">{change.label}</p>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <div className="rounded-lg border border-border/40 bg-muted/10 p-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Actual</p>
                <p className="mt-2 whitespace-pre-wrap break-all text-sm text-muted-foreground">{change.previous}</p>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-emerald-700 dark:text-emerald-400">Nuevo</p>
                <p className="mt-2 whitespace-pre-wrap break-all text-sm">{change.next}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
