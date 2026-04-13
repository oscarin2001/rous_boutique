"use client";

import { useMemo } from "react";

import { ChevronsUpDown, LogOut, Settings, Shield, User } from "lucide-react";

import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface NavUserProps {
  firstName: string;
  lastName: string;
  roleCode: string;
  photoUrl?: string | null;
  logoutAction: () => void;
}

export function NavUser({
  firstName,
  lastName,
  roleCode,
  photoUrl,
  logoutAction,
}: NavUserProps) {
  const { isMobile } = useSidebar();
  const initials = useMemo(() => `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase(), [firstName, lastName]);

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
              {photoUrl ? <AvatarImage src={photoUrl} alt="Foto de perfil" /> : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {firstName} {lastName}
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
            className="sa-user-menu w-56"
          >
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Avatar className="size-8">
                {photoUrl ? <AvatarImage src={photoUrl} alt="Foto de perfil" /> : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid text-sm leading-tight">
                <span className="font-semibold">
                  {firstName} {lastName}
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
            <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
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
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
