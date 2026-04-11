import { getSuperAdminMeProfileAction } from "@/actions/super-admin/me";

import { EditNav } from "@/components/super-admin/dashboard/me/content/edit-nav";

import { PersonalForm } from "../form/personal-form";

export async function PersonalPageContent() {
  const result = await getSuperAdminMeProfileAction();

  if (!result.success || !result.data) {
    return <p className="text-sm text-muted-foreground">No se pudo cargar el perfil.</p>;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Datos personales</h1>
        <p className="text-sm text-muted-foreground">Actualiza tu informacion base del perfil.</p>
      </header>
      <EditNav active="/dashboard/me/personal" />
      <PersonalForm profile={result.data} />
    </div>
  );
}
