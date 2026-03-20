import {
  getBranchManagers,
  getBranchSuppliers,
  getBranchWarehouses,
  getBranches,
} from "@/actions/super-admin/branches";

import { BranchesPageContent } from "./branches-page-content";

export async function BranchesPage() {
  const [branches, managerOptions, warehouseOptions, supplierOptions] = await Promise.all([
    getBranches(),
    getBranchManagers(),
    getBranchWarehouses(),
    getBranchSuppliers(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestion de Sucursales</h1>
        <p className="mt-1 text-muted-foreground">
          Crea, actualiza y gestiona el estado operativo de todas las sucursales.
        </p>
      </div>
      <BranchesPageContent
        initialBranches={branches}
        managerOptions={managerOptions}
        warehouseOptions={warehouseOptions}
        supplierOptions={supplierOptions}
      />
    </div>
  );
}
