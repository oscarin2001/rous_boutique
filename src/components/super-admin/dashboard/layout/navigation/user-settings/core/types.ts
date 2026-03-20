export type TabId =
  | "profile"
  | "notifications"
  | "system"
  | "account-security"
  | "superadmins"
  | "audit";

export type ProfileForm = {
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  ci: string;
  profession: string;
  photoUrl: string;
  aboutMe: string;
  skills: string;
  initialUsername: string;
  username: string;
  newPassword: string;
  newPasswordConfirm: string;
  lastLogin: string | null;
  canChangeCredentials: boolean;
  lastCredentialChangeAt: string | null;
  nextCredentialChangeAt: string | null;
};

export type SystemForm = {
  theme: "light" | "dark" | "system";
  language: "es" | "en" | "pt" | "fr";
  notifications: boolean;
  timezone: string;
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  timeFormat: "12h" | "24h";
  currency: "BOB" | "USD" | "EUR";
  sessionTtlMinutes: number;
  emergencyPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  signatureDisplayName: string;
  signatureTitle: string;
  notificationChannels: {
    login: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    security: boolean;
  };
};

export type CreateSuperAdminForm = {
  firstName: string;
  lastName: string;
  birthDate: string;
  ci: string;
  phone: string;
  username: string;
  password: string;
  passwordConfirm: string;
};

export type ProfileFieldErrors = Partial<Record<"firstName" | "lastName" | "birthDate" | "phone" | "ci" | "profession" | "photoUrl" | "aboutMe" | "skills" | "username" | "currentPassword" | "newPassword" | "newPasswordConfirm", string>>;
export type CreateAccountFieldErrors = Partial<Record<keyof CreateSuperAdminForm, string>>;

export type SessionRow = {
  sessionId: string;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  revokedAt: string | null;
  isCurrent: boolean;
};

export type AuditFeedRow = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  actorName: string;
};

export type SensitiveAction = "profile" | "system" | "createAccount" | "revokeSessions";
