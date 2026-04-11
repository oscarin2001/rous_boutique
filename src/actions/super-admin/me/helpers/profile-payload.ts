import type { EditableProfile, UpdateProfilePayload } from "../types";

type PayloadOverrides = Partial<
  Pick<
    UpdateProfilePayload,
    | "firstName"
    | "lastName"
    | "birthDate"
    | "phone"
    | "ci"
    | "profession"
    | "photoUrl"
    | "aboutMe"
    | "skills"
    | "languages"
    | "username"
    | "newPassword"
    | "newPasswordConfirm"
  >
>;

export function buildUpdateProfilePayload(
  profile: EditableProfile,
  currentPassword: string,
  overrides: PayloadOverrides = {},
): UpdateProfilePayload {
  return {
    firstName: overrides.firstName ?? profile.firstName,
    lastName: overrides.lastName ?? profile.lastName,
    birthDate: overrides.birthDate ?? profile.birthDate,
    phone: overrides.phone ?? profile.phone,
    ci: overrides.ci ?? profile.ci,
    profession: overrides.profession ?? profile.profession,
    photoUrl: overrides.photoUrl ?? profile.photoUrl,
    aboutMe: overrides.aboutMe ?? profile.aboutMe,
    skills: overrides.skills ?? profile.skills,
    languages: overrides.languages ?? profile.languages,
    username: overrides.username ?? profile.username,
    currentPassword,
    newPassword: overrides.newPassword ?? "",
    newPasswordConfirm: overrides.newPasswordConfirm ?? "",
  };
}
