import { getSuperAdminMeProfileAction } from "@/actions/super-admin/me";

import { EditNav } from "@/components/super-admin/dashboard/me/content/edit-nav";

import { SecurityForm } from "../form/security-form";

export async function SecurityPageContent() {
  const result = await getSuperAdminMeProfileAction();

  if (!result.success || !result.data) {
    return <p className="text-sm text-muted-foreground">No se pudo cargar el perfil.</p>;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Seguridad</h1>
        <p className="text-sm text-muted-foreground">Actualiza usuario y contrasena de acceso.</p>
      </header>
      <EditNav active="/dashboard/me/security" />
      <SecurityForm profile={result.data} />
    </div>
  );
}
