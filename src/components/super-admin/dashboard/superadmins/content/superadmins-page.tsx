import { getSuperAdmins } from "@/actions/super-admin/superadmins/queries";

import { SuperAdminsPageContent } from "./superadmins-page-content";

export async function SuperAdminsPage() {
  const superAdmins = await getSuperAdmins();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Gestion de super admins</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea, actualiza, audita y controla el estado de cuentas con permisos globales.
        </p>
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
        <div className="rounded-md border border-border px-3 py-2 text-xs">
          <p className="text-muted-foreground">Regla de seguridad</p>
          <p className="font-medium">Todas las acciones sensibles requieren contrasena de confirmacion.</p>
        </div>
        <div className="rounded-md border border-border px-3 py-2 text-xs">
          <p className="text-muted-foreground">Control de acceso</p>
          <p className="font-medium">No se permite autoeliminacion ni bloqueo total de super admins activos.</p>
        </div>
        <div className="rounded-md border border-border px-3 py-2 text-xs">
          <p className="text-muted-foreground">Auditoria</p>
          <p className="font-medium">Cada alta, edicion, cambio de estado o baja queda registrada.</p>
        </div>
      </div>

      <SuperAdminsPageContent initialSuperAdmins={superAdmins} />
    </div>
  );
}
