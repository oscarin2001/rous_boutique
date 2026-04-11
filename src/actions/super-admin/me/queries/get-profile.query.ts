"use server";

import { getSuperAdminProfileAction } from "@/actions/super-admin/user-settings/actions";

export async function getSuperAdminMeProfileAction() {
  return getSuperAdminProfileAction();
}
