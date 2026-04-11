"use server";

import { revalidatePath } from "next/cache";

import {
  getSuperAdminProfileAction,
  updateSuperAdminProfileAction,
} from "@/actions/super-admin/user-settings/actions";

import { buildUpdateProfilePayload } from "../helpers";
import { personalSectionSchema, type PersonalSectionSchemaInput } from "../schemas";

export async function updateSuperAdminMePersonalAction(input: PersonalSectionSchemaInput) {
  const parsed = personalSectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
  }

  const profileResult = await getSuperAdminProfileAction();
  if (!profileResult.success || !profileResult.data) {
    return { success: false, error: profileResult.error ?? "No se pudo cargar el perfil" };
  }

  const result = await updateSuperAdminProfileAction(
    buildUpdateProfilePayload(profileResult.data, parsed.data.currentPassword, {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      birthDate: parsed.data.birthDate,
      phone: parsed.data.phone,
      ci: parsed.data.ci,
      profession: parsed.data.profession,
      aboutMe: parsed.data.aboutMe,
    }),
  );

  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/me");
    revalidatePath("/dashboard/me/personal");
  }

  return result;
}
