import { getSuperAdminMeProfileAction } from "@/actions/super-admin/me";

import { EditNav } from "../../content/edit-nav";
import { CompetenciesForm } from "../form/competencies-form";

export async function CompetenciesPageContent() {
  const result = await getSuperAdminMeProfileAction();

  if (!result.success || !result.data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">No se pudo cargar el perfil.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <EditNav active="/dashboard/me/competencies" nextAvailableAt={result.data.nextCompetenciesEditAt} />
        <CompetenciesForm profile={result.data} />
      </div>
    </div>
  );
}