import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Store,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
}

export interface NavGroup {
  label: string;
  icon?: LucideIcon;
  items: NavItem[];
}

export const superAdminNavGroups: NavGroup[] = [
  {
    label: "General",
    items: [
      { title: "Panel de Control", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Sucursales",
    icon: Store,
    items: [
      { title: "Gestión de Sucursales", url: "/dashboard/branches", icon: Store },
      { title: "Proveedores", url: "/dashboard/suppliers", icon: Truck },
    ],
  },
  {
    label: "Inventario",
    icon: Package,
    items: [
      { title: "Productos", url: "/dashboard/products", icon: Package },
      { title: "Bodegas", url: "/dashboard/warehouses", icon: Warehouse },
      { title: "Inventario Global", url: "/dashboard/inventory", icon: Warehouse },
    ],
  },
  {
    label: "Operaciones",
    icon: ClipboardList,
    items: [
      { title: "Pedidos", url: "/dashboard/orders", icon: ClipboardList },
    ],
  },
  {
    label: "Administración",
    icon: ShieldCheck,
    items: [
      { title: "Usuarios", url: "/dashboard/users", icon: Users },
      { title: "Encargados de sucursal", url: "/dashboard/managers", icon: Users },
    ],
  },
];