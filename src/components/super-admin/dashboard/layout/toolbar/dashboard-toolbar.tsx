"use client";

import { Fragment, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { Bell, Languages, Maximize, MessageSquare, Minimize, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { usePathname, useRouter } from "next/navigation";

import {
  getSuperAdminToolbarLanguageAction,
  getSuperAdminToolbarNotificationsAction,
  markSuperAdminToolbarNotificationsReadAction,
  updateSuperAdminToolbarLanguageAction,
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
  Notificaciones: { es: "Notificaciones", en: "Notifications" },
  Inventario: { es: "Inventario", en: "Inventory" },
  "Red Operativa": { es: "Red Operativa", en: "Operations Network" },
  Sucursales: { es: "Sucursales", en: "Branches" },
  Almacenes: { es: "Almacenes", en: "Warehouses" },
  Proveedores: { es: "Proveedores", en: "Suppliers" },
  "Catalogo y Stock": { es: "Catalogo y Stock", en: "Catalog and Stock" },
  Productos: { es: "Productos", en: "Products" },
  Organizacion: { es: "Organizacion", en: "Organization" },
  "Encargados de sucursal": { es: "Encargados de sucursal", en: "Branch Managers" },
  "Super Admins": { es: "Super Admins", en: "Super Admins" },
  Usuarios: { es: "Usuarios", en: "Users" },
  Configuraciones: { es: "Configuraciones", en: "Settings" },
  Dashboard: { es: "Dashboard", en: "Dashboard" },
};

type ToolbarNotice = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  actorName: string;
  showExactTimestamp: boolean;
  lastConnectionAt: string | null;
};

type ToolbarLanguage = "es" | "en" | "pt" | "fr";

const NOTIFICATIONS_POLL_INTERVAL_MS = 120_000;

const languageOptions: Array<{ value: ToolbarLanguage; label: string }> = [
  { value: "es", label: "Espanol" },
  { value: "en", label: "English" },
  { value: "pt", label: "Portugues" },
  { value: "fr", label: "Francais" },
];

export function DashboardToolbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [, startTransition] = useTransition();
  const [language, setLanguage] = useState<ToolbarLanguage>("es");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notices, setNotices] = useState<ToolbarNotice[]>([]);
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);
  const [mounted, setMounted] = useState(false);
  const notificationsRequestInFlightRef = useRef(false);
  const breadcrumbs = useMemo(() => buildBreadcrumbs(pathname, language), [pathname, language]);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleNotificationsOpenChange = (open: boolean) => {
    if (!open || unreadCount === 0) return;
    startTransition(async () => {
      const result = await markSuperAdminToolbarNotificationsReadAction();
      if (result.success) setUnreadCount(0);
    });
  };

  useEffect(() => {
    startTransition(async () => {
      const result = await getSuperAdminToolbarLanguageAction();
      if (result.success && result.data) {
        setLanguage(result.data.language);
      }
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const stopPolling = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const loadNotifications = () => {
      if (notificationsRequestInFlightRef.current) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

      notificationsRequestInFlightRef.current = true;
      startTransition(async () => {
        try {
          const result = await getSuperAdminToolbarNotificationsAction();
          if (!mounted || !result.success || !result.data) return;
          setUnreadCount(result.data.unreadCount);
          setNotices(result.data.items);
        } finally {
          notificationsRequestInFlightRef.current = false;
        }
      });
    };

    const startPolling = () => {
      if (intervalId !== null) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      intervalId = setInterval(loadNotifications, NOTIFICATIONS_POLL_INTERVAL_MS);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadNotifications();
        startPolling();
        return;
      }

      stopPolling();
    };

    loadNotifications();
    startPolling();
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", loadNotifications);
    window.addEventListener("online", loadNotifications);

    return () => {
      mounted = false;
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", loadNotifications);
      window.removeEventListener("online", loadNotifications);
      notificationsRequestInFlightRef.current = false;
    };
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await document.documentElement.requestFullscreen();
  };

  const onChangeLanguage = (next: ToolbarLanguage) => {
    if (next === language || isSavingLanguage) return;

    setLanguage(next);
    setIsSavingLanguage(true);
    startTransition(async () => {
      const result = await updateSuperAdminToolbarLanguageAction(next);
      setIsSavingLanguage(false);
      if (!result.success) {
        toast.error(result.error ?? "No se pudo actualizar el idioma");
      }
    });
  };

  return (
    <header className="sticky top-2 z-10 mx-2 flex h-14 shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-card/90 px-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
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
                {item.showExactTimestamp ? (
                  <p className="text-[11px] text-muted-foreground">{new Date(item.createdAt).toLocaleString("es-BO")} - {item.actorName}</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">Ultima conexion: {item.lastConnectionAt ? new Date(item.lastConnectionAt).toLocaleString("es-BO") : "sin dato"}</p>
                )}
              </DropdownMenuItem>
            )) : <DropdownMenuItem disabled>No hay notificaciones recientes.</DropdownMenuItem>}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/notifications")}>Ver todas las notificaciones</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="icon-sm">
          <MessageSquare className="size-4" />
          <span className="sr-only">Mensajes</span>
        </Button>
        <Button variant="outline" size="icon-sm" onClick={toggleTheme}>
            {mounted && (resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />)}
            <span className="sr-only">Cambiar tema</span>
        </Button>
        <Button variant="outline" size="icon-sm" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
          <span className="sr-only">Pantalla completa</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
            <Languages className="size-4" />
            {language.toUpperCase()}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Idioma</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {languageOptions.map((item) => (
              <DropdownMenuItem key={item.value} onClick={() => onChangeLanguage(item.value)}>
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function resolveTranslationLanguage(language: ToolbarLanguage): "es" | "en" {
  return language === "es" ? "es" : "en";
}

function t(label: string, language: ToolbarLanguage) {
  return translations[label]?.[resolveTranslationLanguage(language)] ?? label;
}

function buildBreadcrumbs(pathname: string, language: ToolbarLanguage): Crumb[] {
  if (pathname === "/dashboard") {
    return [{ label: t("Vista Ejecutiva", language), href: "/dashboard" }];
  }

  if (pathname.startsWith("/dashboard/me")) {
    const meRootLabel = language === "es" ? "Mi perfil" : "My profile";
    if (pathname === "/dashboard/me") {
      return [{ label: meRootLabel, href: "/dashboard/me" }];
    }

    const meSectionLabelMap: Record<string, string> = {
      personal: language === "es" ? "Datos personales" : "Personal details",
      competencies: language === "es" ? "Competencias" : "Competencies",
      security: language === "es" ? "Seguridad" : "Security",
    };

    const section = pathname.split("/")[3] ?? "";
    const sectionLabel = meSectionLabelMap[section] ?? section;

    return [
      { label: meRootLabel, href: "/dashboard/me" },
      { label: sectionLabel, href: pathname },
    ];
  }

  if (pathname.startsWith("/dashboard/notifications")) {
    return [{ label: language === "es" ? "Notificaciones" : "Notifications", href: "/dashboard/notifications" }];
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
