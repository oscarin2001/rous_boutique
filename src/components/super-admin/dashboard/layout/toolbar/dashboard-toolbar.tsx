"use client";

import { Fragment, useEffect, useState, useTransition } from "react";

import { Bell, Search } from "lucide-react";

import { usePathname } from "next/navigation";

import { getSuperAdminToolbarNotificationsAction, markSuperAdminToolbarNotificationsReadAction } from "@/actions/super-admin/user-settings/actions";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { superAdminNavGroups } from "../navigation";

interface Crumb {
  label: string;
  href: string;
}

type ToolbarNotice = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  actorName: string;
};

export function DashboardToolbar() {
  const pathname = usePathname();
  const breadcrumbs = buildBreadcrumbs(pathname);
  const [, startTransition] = useTransition();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notices, setNotices] = useState<ToolbarNotice[]>([]);

  const handleNotificationsOpenChange = (open: boolean) => {
    if (!open || unreadCount === 0) return;
    startTransition(async () => {
      const result = await markSuperAdminToolbarNotificationsReadAction();
      if (result.success) setUnreadCount(0);
    });
  };

  useEffect(() => {
    let mounted = true;

    const loadNotifications = () => {
      startTransition(async () => {
        const result = await getSuperAdminToolbarNotificationsAction();
        if (!mounted || !result.success || !result.data) return;
        setUnreadCount(result.data.unreadCount);
        setNotices(result.data.items);
      });
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <SidebarTrigger className="-ml-1" />
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <Fragment key={crumb.label}>
                <BreadcrumbItem>
                  {!isLast ? (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden lg:block">
          <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
           
            className="w-64 bg-muted/40 pl-8"
          />
        </div>
        <DropdownMenu onOpenChange={handleNotificationsOpenChange}>
          <DropdownMenuTrigger render={<Button variant="outline" size="icon-sm" className="relative" />}>
            <Bell className="size-4" />
            {unreadCount > 0 ? <Badge className="absolute -top-2 -right-2 h-4 min-w-4 px-1 text-[10px]" variant="destructive">{Math.min(unreadCount, 99)}</Badge> : null}
            <span className="sr-only">Notificaciones</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Notificaciones de configuracion</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {notices.length ? notices.map((item) => (
              <DropdownMenuItem key={item.id} className="block space-y-1">
                <p className="text-xs font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <p className="text-[11px] text-muted-foreground">{new Date(item.createdAt).toLocaleString("es-BO")} - {item.actorName}</p>
              </DropdownMenuItem>
            )) : <DropdownMenuItem disabled>No hay notificaciones recientes.</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function buildBreadcrumbs(pathname: string): Crumb[] {
  const breadcrumbs: Crumb[] = [{ label: "Dashboard", href: "/dashboard" }];

  if (pathname === "/dashboard") {
    return breadcrumbs;
  }

  for (const group of superAdminNavGroups) {
    for (const item of group.items) {
      if (pathname.startsWith(item.url) && item.url !== "/dashboard") {
        breadcrumbs.push({ label: item.title, href: item.url });
        return breadcrumbs;
      }
    }
  }

  return breadcrumbs;
}