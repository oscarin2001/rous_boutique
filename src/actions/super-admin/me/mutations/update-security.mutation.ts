"use server";

import { revalidatePath } from "next/cache";

import {
  getSuperAdminProfileAction,
  updateSuperAdminProfileAction,
} from "@/actions/super-admin/user-settings/actions";

import { buildUpdateProfilePayload } from "../helpers";
import { securitySectionSchema, type SecuritySectionSchemaInput } from "../schemas";

export async function updateSuperAdminMeSecurityAction(input: SecuritySectionSchemaInput) {
  const parsed = securitySectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
  }

  const profileResult = await getSuperAdminProfileAction();
  if (!profileResult.success || !profileResult.data) {
    return { success: false, error: profileResult.error ?? "No se pudo cargar el perfil" };
  }

  if (!profileResult.data.canChangeCredentials) {
    return { success: false, error: "Aun no puedes cambiar credenciales" };
  }

  const result = await updateSuperAdminProfileAction(
    buildUpdateProfilePayload(profileResult.data, parsed.data.currentPassword, {
      username: parsed.data.username,
      newPassword: parsed.data.newPassword,
      newPasswordConfirm: parsed.data.newPasswordConfirm,
    }),
  );

  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/me");
    revalidatePath("/dashboard/me/security");
  }

  return result;
}
