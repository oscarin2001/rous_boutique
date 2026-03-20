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
  dropdownTitle?: string;
  icon?: LucideIcon;
  items: NavItem[];
}

export const superAdminNavGroups: NavGroup[] = [
  {
    label: "Vista Ejecutiva",
    dropdownTitle: "Monitoreo",
    icon: LayoutDashboard,
    items: [
      { title: "Panel Ejecutivo", url: "/dashboard", icon: LayoutDashboard },
      { title: "Pedidos", url: "/dashboard/orders", icon: ClipboardList },
      { title: "Inventario", url: "/dashboard/inventory", icon: Warehouse },
    ],
  },
  {
    label: "Red Operativa",
    dropdownTitle: "Operaciones",
    icon: Store,
    items: [
      { title: "Sucursales", url: "/dashboard/branches", icon: Store },
      { title: "Almacenes", url: "/dashboard/warehouses", icon: Warehouse },
      { title: "Proveedores", url: "/dashboard/suppliers", icon: Truck },
    ],
  },
  {
    label: "Catalogo y Stock",
    dropdownTitle: "Catalogo",
    icon: Package,
    items: [
      { title: "Productos", url: "/dashboard/products", icon: Package },
    ],
  },
  {
    label: "Organizacion",
    dropdownTitle: "Equipo",
    icon: ShieldCheck,
    items: [
      { title: "Encargados de sucursal", url: "/dashboard/managers", icon: Users },
      { title: "Usuarios", url: "/dashboard/users", icon: Users },
    ],
  },
];