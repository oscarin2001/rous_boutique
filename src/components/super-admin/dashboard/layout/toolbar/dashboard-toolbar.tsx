"use client";

import { Fragment, useEffect, useMemo, useState, useTransition } from "react";

import { Bell, Languages, Maximize, MessageSquare, Minimize, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { usePathname } from "next/navigation";

import {
  getSuperAdminToolbarNotificationsAction,
  markSuperAdminToolbarNotificationsReadAction,
} from "@/actions/super-admin/user-settings/actions";

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
import { SidebarTrigger } from "@/components/ui/sidebar";

import { superAdminNavGroups } from "../navigation";

interface Crumb {
  label: string;
  href: string;
}

const translations: Record<string, { es: string; en: string }> = {
  "Vista Ejecutiva": { es: "Vista Ejecutiva", en: "Executive View" },
  "Panel Ejecutivo": { es: "Panel Ejecutivo", en: "Executive Panel" },
  Pedidos: { es: "Pedidos", en: "Orders" },
  Inventario: { es: "Inventario", en: "Inventory" },
  "Red Operativa": { es: "Red Operativa", en: "Operations Network" },
  Sucursales: { es: "Sucursales", en: "Branches" },
  Almacenes: { es: "Almacenes", en: "Warehouses" },
  Proveedores: { es: "Proveedores", en: "Suppliers" },
  "Catalogo y Stock": { es: "Catalogo y Stock", en: "Catalog and Stock" },
  Productos: { es: "Productos", en: "Products" },
  Organizacion: { es: "Organizacion", en: "Organization" },
  "Encargados de sucursal": { es: "Encargados de sucursal", en: "Branch Managers" },
  Usuarios: { es: "Usuarios", en: "Users" },
  Dashboard: { es: "Dashboard", en: "Dashboard" },
};

type ToolbarNotice = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  actorName: string;
};

export function DashboardToolbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [, startTransition] = useTransition();
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notices, setNotices] = useState<ToolbarNotice[]>([]);
  const breadcrumbs = useMemo(() => buildBreadcrumbs(pathname, language), [pathname, language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
    };
  }, []);

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");
  const toggleLanguage = () => setLanguage((current) => (current === "es" ? "en" : "es"));

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

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await document.documentElement.requestFullscreen();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-border/70 bg-card/90 px-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
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
        <DropdownMenu onOpenChange={handleNotificationsOpenChange}>
          <DropdownMenuTrigger render={<Button variant="outline" size="icon-sm" className="relative" />}>
            <Bell className="size-4" />
            {unreadCount > 0 ? (
              <Badge className="absolute -top-2 -right-2 h-4 min-w-4 px-1 text-[10px]" variant="destructive">
                {Math.min(unreadCount, 99)}
              </Badge>
            ) : null}
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
        <Button variant="outline" size="icon-sm">
          <MessageSquare className="size-4" />
          <span className="sr-only">Mensajes</span>
        </Button>
        <Button variant="outline" size="icon-sm" onClick={toggleTheme}>
            {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            <span className="sr-only">Cambiar tema</span>
        </Button>
        <Button variant="outline" size="icon-sm" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
          <span className="sr-only">Pantalla completa</span>
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={toggleLanguage}>
          <Languages className="size-4" />
          {language.toUpperCase()}
        </Button>
      </div>
    </header>
  );
}

function t(label: string, language: "es" | "en") {
  return translations[label]?.[language] ?? label;
}

function buildBreadcrumbs(pathname: string, language: "es" | "en"): Crumb[] {
  if (pathname === "/dashboard") {
    return [{ label: t("Vista Ejecutiva", language), href: "/dashboard" }];
  }

  for (const group of superAdminNavGroups) {
    for (const item of group.items) {
      if (pathname.startsWith(item.url) && item.url !== "/dashboard") {
        const breadcrumbs: Crumb[] = [
          { label: t(group.label, language), href: group.items[0]?.url ?? "/dashboard" },
        ];

        if (group.label !== item.title) {
          breadcrumbs.push({ label: t(item.title, language), href: item.url });
        }

        return breadcrumbs;
      }
    }
  }

  return [{ label: t("Dashboard", language), href: "/dashboard" }];
}