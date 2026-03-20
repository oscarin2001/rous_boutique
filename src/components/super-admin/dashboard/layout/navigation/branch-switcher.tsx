"use client";

import { useEffect, useMemo, useState } from "react";

import { ChevronsUpDown, Plus, Store } from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const ACTIVE_BRANCH_KEY = "rb-active-branch";

export function BranchSwitcher({
  branches,
  defaultBranchId,
}: {
  branches: BranchItem[];
  defaultBranchId: number | null;
}) {
  const [activeBranchId, setActiveBranchId] = useState<number | null>(defaultBranchId);

  useEffect(() => {
    const stored = window.localStorage.getItem(ACTIVE_BRANCH_KEY);
    if (!stored) return;

    const parsed = Number(stored);
    if (!Number.isNaN(parsed)) {
      setActiveBranchId(parsed);
    }
  }, []);

  const activeBranch = useMemo(() => {
    if (activeBranchId == null) return null;
    return branches.find((branch) => branch.id === activeBranchId) ?? null;
  }, [activeBranchId, branches]);

  const selectBranch = (branchId: number) => {
    setActiveBranchId(branchId);
    window.localStorage.setItem(ACTIVE_BRANCH_KEY, String(branchId));
    document.cookie = `rb-active-branch=${branchId}; path=/; max-age=31536000; samesite=lax`;
    window.dispatchEvent(
      new CustomEvent("rb:branches:active-changed", {
        detail: { branchId },
      })
    );
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent"
              />
            }
          >
            <div className="overflow-hidden rounded-md bg-background p-0.5">
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
              <span className="truncate text-xs text-muted-foreground">
                {activeBranch
                  ? `${activeBranch.name} (${activeBranch.city})`
                  : `${branches.length} sucursal(es)`}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Sucursales</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {branches.map((branch) => (
              <DropdownMenuItem
                key={branch.id}
                onClick={() => selectBranch(branch.id)}
                className={branch.id === activeBranchId ? "bg-muted" : ""}
              >
                <Store className="size-4" />
                <div className="grid">
                  <span>{branch.name}</span>
                  <span className="text-xs text-muted-foreground">{branch.city}</span>
                </div>
              </DropdownMenuItem>
            ))}
            {branches.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Sin sucursales
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/dashboard/branches" />}>
              <Plus className="size-4" />
              Gestionar Sucursales
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}