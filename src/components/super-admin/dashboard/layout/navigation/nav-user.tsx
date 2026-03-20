"use client";

import { useMemo, useState } from "react";

import { ChevronsUpDown, LogOut, Settings, Shield, User, UserPen } from "lucide-react";

import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { UserSettingsDialog } from "./user-settings";

interface NavUserProps {
  firstName: string;
  lastName: string;
  roleCode: string;
  logoutAction: () => void;
}

export function NavUser({
  firstName,
  lastName,
  roleCode,
  logoutAction,
}: NavUserProps) {
  const { isMobile } = useSidebar();
  const [openSettings, setOpenSettings] = useState(false);
  const [settingsEntryPoint, setSettingsEntryPoint] = useState<"profile-view" | "profile-edit" | "settings">("settings");
  const [displayName, setDisplayName] = useState({ firstName, lastName });
  const initials = useMemo(() => `${displayName.firstName.charAt(0)}${displayName.lastName.charAt(0)}`.toUpperCase(), [displayName]);

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
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {displayName.firstName} {displayName.lastName}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {roleCode}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            className="w-56"
          >
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid text-sm leading-tight">
                <span className="font-semibold">
                  {displayName.firstName} {displayName.lastName}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="size-3" />
                  {roleCode}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/dashboard/me" />}>
              <User className="size-4" />
              Ver mi perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSettingsEntryPoint("profile-edit"); setOpenSettings(true); }}>
              <UserPen className="size-4" />
              Editar perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSettingsEntryPoint("settings"); setOpenSettings(true); }}>
              <Settings className="size-4" />
              Configuraciones
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logoutAction}>
              <DropdownMenuItem nativeButton render={<button type="submit" className="w-full" />}>
                <LogOut className="size-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
        <UserSettingsDialog open={openSettings} onOpenChange={setOpenSettings} entryPoint={settingsEntryPoint} onProfileIdentityChange={(payload) => setDisplayName(payload)} />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}