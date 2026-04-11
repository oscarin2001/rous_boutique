"use client";

import { logoutAction } from "@/actions/auth";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { BranchSwitcher } from "./branch-switcher";
import { superAdminNavGroups } from "./config";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

interface AppSidebarProps {
  firstName: string;
  lastName: string;
  roleCode: string;
  photoUrl?: string | null;
  branches: { id: number; name: string; city: string }[];
  defaultBranchId: number | null;
}

export function AppSidebar({
  firstName,
  lastName,
  roleCode,
  photoUrl,
  branches,
  defaultBranchId,
}: AppSidebarProps) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <BranchSwitcher
          branches={branches}
          defaultBranchId={defaultBranchId}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={superAdminNavGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          firstName={firstName}
          lastName={lastName}
          roleCode={roleCode}
          photoUrl={photoUrl}
          logoutAction={logoutAction}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
