import { Suspense } from "react";

import { SuppliersPageContent } from "@/components/super-admin/dashboard/suppliers/content";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Proveedores | Super Admin",
  description:
    "Gestiona tus aliados comerciales, proveedores y cadena de suministro de manera eficiente.",
  keywords: ["proveedores", "aliados comerciales", "cadena de suministro", "super admin"],
};

export default function SuppliersPage() {
  return (
    <div className="space-y-8">
      {/* Header de la página */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Proveedores
        </h1>
        <p className="text-muted-foreground text-lg">
          Administra tus aliados comerciales y optimiza tu cadena de suministro.
        </p>
      </div>

      {/* Contenido principal con loading */}
      <Suspense fallback={<SuppliersSkeleton />}>
        <SuppliersPageContent />
      </Suspense>
    </div>
  );
}

function SuppliersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>

      {/* Tabla o contenido principal skeleton */}
      <div className="rounded-xl border bg-card">
        <Skeleton className="h-14 w-full rounded-t-xl" />
        <div className="p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}