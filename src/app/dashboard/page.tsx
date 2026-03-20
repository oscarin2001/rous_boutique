import { KpiCards } from "@/components/super-admin/dashboard/overview";

import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel de Administracion</h1>
        <p className="mt-1 text-muted-foreground">
          Bienvenido, {session?.firstName}. Rous Boutique - Gestion Administrativa.
        </p>
      </div>
      <KpiCards />
    </div>
  );
}

