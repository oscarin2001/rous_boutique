import { getSuperAdminMeProfileAction } from "@/actions/super-admin/me";

import { EditNav } from "../../content/edit-nav";
import { PersonalForm } from "../form/personal-form";

export async function PersonalPageContent() {
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
        <h1 className="text-4xl font-semibold tracking-tight">Datos personales</h1>
        <p className="text-lg text-muted-foreground">
          Actualiza tu información básica y resumen profesional.
        </p>
      </div>

      <EditNav active="/dashboard/me/personal" />
      <PersonalForm profile={result.data} />
    </div>
  );
}