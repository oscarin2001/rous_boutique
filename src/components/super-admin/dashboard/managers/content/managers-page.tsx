import { getManagerBranchOptions, getManagers } from "@/actions/super-admin/managers";

import { ManagersPageContent } from "./managers-page-content";

export async function ManagersPage() {
  const [managers, branchOptions] = await Promise.all([
    getManagers(),
    getManagerBranchOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestion de Encargados de sucursal</h1>
        <p className="mt-1 text-muted-foreground">
          Crea, actualiza y controla el acceso de los encargados de sucursal.
        </p>
      </div>

      <ManagersPageContent
        initialManagers={managers}
        branchOptions={branchOptions}
      />
    </div>
  );
}
