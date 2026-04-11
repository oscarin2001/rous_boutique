import Link from "next/link";

const items = [
  { href: "/dashboard/me/personal", label: "Datos personales" },
  { href: "/dashboard/me/competencies", label: "Competencias" },
  { href: "/dashboard/me/security", label: "Seguridad" },
] as const;

type Props = {
  active: (typeof items)[number]["href"];
};

export function EditNav({ active }: Props) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            item.href === active
              ? "bg-muted text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
