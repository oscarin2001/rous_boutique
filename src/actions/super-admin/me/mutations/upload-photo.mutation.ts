"use server";

import { uploadSuperAdminProfilePhotoAction } from "@/actions/super-admin/user-settings/actions";

export async function uploadSuperAdminMePhotoAction(file: File) {
  return uploadSuperAdminProfilePhotoAction(file);
}
