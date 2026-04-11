import { getSuperAdminMeProfileAction } from "@/actions/super-admin/me";

import { EditNav } from "@/components/super-admin/dashboard/me/content/edit-nav";

import { CompetenciesForm } from "../form/competencies-form";

export async function CompetenciesPageContent() {
  const result = await getSuperAdminMeProfileAction();

  if (!result.success || !result.data) {
    return <p className="text-sm text-muted-foreground">No se pudo cargar el perfil.</p>;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Competencias</h1>
        <p className="text-sm text-muted-foreground">Gestiona habilidades e idiomas del perfil.</p>
      </header>
      <EditNav active="/dashboard/me/competencies" />
      <CompetenciesForm profile={result.data} />
    </div>
  );
}
