import { PencilLine } from "lucide-react";

import Link from "next/link";

type Props = {
  aboutMe: string | null | undefined;
};

export function ProfileSummaryCard({ aboutMe }: Props) {
  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-border/60 bg-card p-8 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold tracking-tight">Resumen profesional</h2>
        <Link
          href="/dashboard/me/personal"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <PencilLine className="size-4" />
          Editar
        </Link>
      </div>

      <div className="min-w-0 rounded-2xl bg-muted/40 p-6 min-h-[140px]">
        <p className="max-w-full break-all whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {aboutMe || "Aún no has agregado una descripción profesional."}
        </p>
      </div>
    </div>
  );
}