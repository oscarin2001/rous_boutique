import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Store,
  Truck,
  Users,
  Warehouse,
  TrendingUp,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  description?: string; // Opcional: para tooltips o futuras mejoras
}

export interface NavGroup {
  label: string;
  dropdownTitle?: string;
  icon: LucideIcon;
  items: NavItem[];
}

/**
 * Navegación para Super Admin
 * Enfocada en monitoreo, visión estratégica y gestión de alto nivel
 */
export const superAdminNavGroups: NavGroup[] = [
  {
    label: "Monitoreo Ejecutivo",
    icon: BarChart3,
    items: [
      {
        title: "Panel Ejecutivo",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Pedidos",
        url: "/dashboard/orders",
        icon: ClipboardList,
      },
      {
        title: "Inventario General",
        url: "/dashboard/inventory",
        icon: Warehouse,
      },
      {
        title: "Métricas y Rendimiento",
        url: "/dashboard/analytics",
        icon: TrendingUp,
      },
    ],
  },
  {
    label: "Red Operativa",
    icon: Building2,
    items: [
      {
        title: "Sucursales",
        url: "/dashboard/branches",
        icon: Store,
      },
      {
        title: "Almacenes / Bodegas",
        url: "/dashboard/warehouses",
        icon: Warehouse,
      },
      {
        title: "Proveedores",
        url: "/dashboard/suppliers",
        icon: Truck,
      },
    ],
  },
  {
    label: "Catálogo y Stock",
    icon: Package,
    items: [
      {
        title: "Productos",
        url: "/dashboard/products",
        icon: Package,
      },
      {
        title: "Gestión de Stock",
        url: "/dashboard/stock-management",
        icon: Warehouse,
      },
    ],
  },
  {
    label: "Organización y Equipo",
    icon: ShieldCheck,
    items: [
      {
        title: "Encargados de Sucursal",
        url: "/dashboard/managers",
        icon: Users,
      },
      {
        title: "Usuarios del Sistema",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        title: "Permisos y Roles",
        url: "/dashboard/roles",
        icon: ShieldCheck,
      },
    ],
  },
];