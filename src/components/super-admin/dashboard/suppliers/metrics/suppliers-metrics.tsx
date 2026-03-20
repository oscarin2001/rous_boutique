"use client";

import { Users, CheckCircle2, ShoppingCart, UserPlus } from "lucide-react";

import type { SupplierMetrics } from "@/actions/super-admin/suppliers/types";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  metrics: SupplierMetrics;
}

export function SuppliersMetrics({ metrics }: Props) {
  const cards = [
    { title: "Total Proveedores", value: metrics.totalSuppliers, icon: Users, color: "text-primary" },
    { title: "Aliados Activos", value: metrics.activeSuppliers, icon: CheckCircle2, color: "text-success" },
    { title: "Nuevos del Mes", value: metrics.newThisMonth, icon: UserPlus, color: "text-info" },
    { title: "Compras Totales", value: metrics.totalPurchases, icon: ShoppingCart, color: "text-warning" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
            <c.icon className={`size-4 ${c.color}`} />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{c.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

