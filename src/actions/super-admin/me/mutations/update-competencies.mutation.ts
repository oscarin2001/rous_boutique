"use server";

import { revalidatePath } from "next/cache";

import {
  getSuperAdminProfileAction,
  updateSuperAdminProfileAction,
} from "@/actions/super-admin/user-settings/actions";

import { buildUpdateProfilePayload } from "../helpers";
import { competenciesSectionSchema, type CompetenciesSectionSchemaInput } from "../schemas";

export async function updateSuperAdminMeCompetenciesAction(input: CompetenciesSectionSchemaInput) {
  const parsed = competenciesSectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
  }

  const profileResult = await getSuperAdminProfileAction();
  if (!profileResult.success || !profileResult.data) {
    return { success: false, error: profileResult.error ?? "No se pudo cargar el perfil" };
  }

  const result = await updateSuperAdminProfileAction(
    buildUpdateProfilePayload(profileResult.data, parsed.data.currentPassword, {
      skills: parsed.data.skills,
      languages: parsed.data.languages,
    }),
  );

  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/me");
    revalidatePath("/dashboard/me/competencies");
  }

  return result;
}
