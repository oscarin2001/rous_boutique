export type EditableProfile = {
  employeeId: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  ci: string;
  profession: string;
  photoUrl: string;
  aboutMe: string;
  skills: string;
  languages: string;
  username: string;
  lastLogin: string | null;
  canChangeCredentials: boolean;
  lastCredentialChangeAt: string | null;
  nextCredentialChangeAt: string | null;
  canEditPersonal: boolean;
  lastPersonalEditAt: string | null;
  nextPersonalEditAt: string | null;
  canEditCompetencies: boolean;
  lastCompetenciesEditAt: string | null;
  nextCompetenciesEditAt: string | null;
  canEditProfile: boolean;
  lastProfileEditAt: string | null;
  nextProfileEditAt: string | null;
};

export type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  ci: string;
  profession: string;
  photoUrl: string;
  aboutMe: string;
  skills: string;
  languages: string;
  username: string;
  currentPassword: string;
  newPassword?: string;
  newPasswordConfirm?: string;
};

export type PersonalSectionInput = {
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  ci: string;
  profession: string;
  aboutMe: string;
  currentPassword: string;
};

export type CompetenciesSectionInput = {
  skills: string;
  languages: string;
  currentPassword: string;
};

export type SecuritySectionInput = {
  username: string;
  newPassword: string;
  newPasswordConfirm: string;
  currentPassword: string;
};

export type PersonalSectionErrors = Partial<
  Record<
    | "firstName"
    | "lastName"
    | "birthDate"
    | "phone"
    | "ci"
    | "profession"
    | "aboutMe"
    | "currentPassword",
    string
  >
>;

export type CompetenciesSectionErrors = Partial<
  Record<"skills" | "languages" | "currentPassword", string>
>;

export type SecuritySectionErrors = Partial<
  Record<"username" | "newPassword" | "newPasswordConfirm" | "currentPassword", string>
>;
