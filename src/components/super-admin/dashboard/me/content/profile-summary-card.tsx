import { PencilLine } from "lucide-react";

import Link from "next/link";

type Props = {
  aboutMe: string | null | undefined;
};

export function ProfileSummaryCard({ aboutMe }: Props) {
  return (
    <section className="min-w-0 rounded-2xl border border-border/50 bg-card p-6">
      <div className="min-w-0 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Resumen de perfil</h2>
          <Link
            href="/dashboard/me/personal"
            className="inline-flex size-9 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <PencilLine className="size-4" />
            <span className="sr-only">Editar datos personales</span>
          </Link>
        </div>

        <div className="min-w-0 rounded-xl border border-border/40 bg-muted/20 p-4">
          <p className="max-h-32 overflow-y-auto whitespace-pre-wrap break-all pr-1 text-sm leading-relaxed text-muted-foreground">
            {aboutMe || "No se ha proporcionado una descripcion del perfil."}
          </p>
        </div>
      </div>
    </section>
  );
}
