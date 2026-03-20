import { getWarehouseOptions, getWarehouses } from "@/actions/super-admin/warehouses";

import { WarehousesPageContent } from "./warehouses-page-content";

export async function WarehousesPage() {
  const [rows, options] = await Promise.all([getWarehouses(), getWarehouseOptions()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestion de Bodegas</h1>
        <p className="mt-1 text-muted-foreground">Administra bodegas, sucursales asignadas y responsables.</p>
      </div>
      <WarehousesPageContent initialRows={rows} options={options} />
    </div>
  );
}