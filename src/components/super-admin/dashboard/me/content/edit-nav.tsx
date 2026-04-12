"use client";

import { User, Award, Shield } from "lucide-react";

import { useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const navItems = [
  { href: "/dashboard/me/personal", label: "Datos personales", icon: User },
  { href: "/dashboard/me/competencies", label: "Competencias", icon: Award },
  { href: "/dashboard/me/security", label: "Seguridad", icon: Shield },
] as const;

type Props = {
  active: (typeof navItems)[number]["href"];
};

export function EditNav({ active }: Props) {
  const router = useRouter();

  return (
    <Tabs
      value={active}
      onValueChange={(value) => router.push(value as Props["active"])}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3 bg-muted/60 p-1.5 rounded-3xl border border-border/70 h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <TabsTrigger
              key={item.href}
              value={item.href}
              className="rounded-2xl py-2.5 text-sm font-medium data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <span className="inline-flex items-center gap-2">
                <Icon className="size-4" />
                {item.label}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}