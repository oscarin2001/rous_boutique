"use client";

import Image from "next/image";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface BranchItem {
  id: number;
  name: string;
  city: string;
}

export function BranchSwitcher({
  branches,
  defaultBranchId,
}: {
  branches: BranchItem[];
  defaultBranchId: number | null;
}) {
  void branches;
  void defaultBranchId;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="pointer-events-none">
          <div className="overflow-hidden rounded-md bg-sidebar-accent/65 p-0.5 ring-1 ring-sidebar-border/70">
            <Image
              src="/branding/logo-rous-boutique.jpg"
              alt="Logo de Rous Boutique"
              width={28}
              height={28}
              className="h-7 w-7 rounded object-cover"
              priority
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Rous Boutique</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}