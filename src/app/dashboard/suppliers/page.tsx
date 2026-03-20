import { Suspense } from "react";

import { SuppliersPageContent } from "@/components/super-admin/dashboard/suppliers/content";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Gestion de Proveedores | Super Admin",
  description: "Panel de administracion de aliados comerciales y suministros",
};

export default function SuppliersPage() {
  return (
    <Suspense fallback={<SuppliersSkeleton />}>
      <SuppliersPageContent />
    </Suspense>
  );
}

function SuppliersSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

