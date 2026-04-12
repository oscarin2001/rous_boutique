import { getSuperAdminMeProfileAction } from "@/actions/super-admin/me";

import { EditNav } from "../../content/edit-nav";
import { SecurityForm } from "../form/security-form";

export async function SecurityPageContent() {
  const result = await getSuperAdminMeProfileAction();

  if (!result.success || !result.data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">No se pudo cargar el perfil.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Seguridad</h1>
        <p className="text-lg text-muted-foreground">
          Protege tu cuenta cambiando usuario y contraseña.
        </p>
      </div>

      <EditNav active="/dashboard/me/security" />
      <SecurityForm profile={result.data} />
    </div>
  );
}