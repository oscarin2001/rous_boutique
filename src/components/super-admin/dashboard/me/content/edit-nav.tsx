"use client";

import { useEffect } from "react";

import { User, Award, Shield } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard/me/personal", label: "Datos personales", icon: User },
  { href: "/dashboard/me/competencies", label: "Competencias", icon: Award },
  { href: "/dashboard/me/security", label: "Seguridad", icon: Shield },
] as const;

type Props = {
  active: (typeof navItems)[number]["href"];
  nextAvailableAt: string | null;
};

function formatNextAvailableDate(value: string | null) {
  if (!value) {
    const fallback = new Date();
    fallback.setMonth(fallback.getMonth() + 3);
    return new Intl.DateTimeFormat("es-BO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(fallback);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "fecha pendiente";
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function EditNav({ active, nextAvailableAt }: Props) {
  const router = useRouter();

  useEffect(() => {
    const nextDate = formatNextAvailableDate(nextAvailableAt);
    toast.info(`Al confirmar cambios, la proxima edicion de esta seccion estara disponible desde ${nextDate}.`);
  }, [active, nextAvailableAt]);

  return (
    <aside className="space-y-2 rounded-xl bg-card/80 p-3">
      <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Secciones</p>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === active;
        return (
          <button
            key={item.href}
            type="button"
            onClick={() => router.push(item.href)}
            className={[
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm",
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            ].join(" ")}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="size-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
}