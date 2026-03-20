import { DollarSign, Package, ShoppingCart, Store } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const kpis = [
  {
    title: "Ventas del Mes",
    value: "Bs. 0",
    description: "Sin datos aún",
    icon: DollarSign,
  },
  {
    title: "Pedidos Pendientes",
    value: "0",
    description: "Sin pedidos",
    icon: ShoppingCart,
  },
  {
    title: "Productos en Stock",
    value: "0",
    description: "Sin inventario",
    icon: Package,
  },
  {
    title: "Sucursales Activas",
    value: "0",
    description: "Configura tu primera sucursal",
    icon: Store,
  },
];

export function KpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground">{kpi.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
