"use client";

import { useEffect, useState, useTransition } from "react";

import { useTheme } from "next-themes";
import { toast } from "sonner";

import {
  createSuperAdminAccountAction,
  getSuperAdminAuditFeedAction,
  getRecentSuperAdminSessionsAction,
  getSuperAdminProfileAction,
  getSuperAdminSystemSettingsAction,
  revokeOtherSuperAdminSessionsAction,
  updateSuperAdminProfileAction,
  updateSuperAdminSystemSettingsAction,
} from "@/actions/super-admin/user-settings/actions";

import { validateCreateAccount, validateProfile } from "../core";
import type { AuditFeedRow, CreateAccountFieldErrors, CreateSuperAdminForm, ProfileFieldErrors, ProfileForm, SensitiveAction, SessionRow, SystemForm, TabId } from "../core";

const initialProfile: ProfileForm = { firstName: "", lastName: "", birthDate: "", phone: "", ci: "", profession: "", photoUrl: "", aboutMe: "", skills: "", languages: "", initialUsername: "", username: "", newPassword: "", newPasswordConfirm: "", lastLogin: null, canChangeCredentials: true, lastCredentialChangeAt: null, nextCredentialChangeAt: null };
const initialSystem: SystemForm = { theme: "system", language: "es", notifications: true, timezone: "America/La_Paz", dateFormat: "DD/MM/YYYY", timeFormat: "24h", currency: "BOB", sessionTtlMinutes: 480, emergencyPhone: "", emergencyContactName: "", emergencyContactPhone: "", signatureDisplayName: "", signatureTitle: "", notificationChannels: { login: true, create: true, update: true, delete: true, security: true } };
const initialCreate: CreateSuperAdminForm = { firstName: "", lastName: "", birthDate: "", ci: "", phone: "", username: "", password: "", passwordConfirm: "" };

function getConfirmMeta(action: SensitiveAction | null) {
  if (action === "profile") return { title: "Confirmar cambios de perfil", description: "Ingresa tu contrasena actual para guardar cambios en perfil y credenciales." };
  if (action === "system") return { title: "Confirmar cambios de sistema", description: "Ingresa tu contrasena actual para actualizar configuracion operativa." };
  if (action === "createAccount") return { title: "Confirmar creacion de superadmin", description: "Ingresa tu contrasena actual para autorizar la nueva cuenta." };
  return { title: "Confirmar cierre de sesiones", description: "Ingresa tu contrasena actual para revocar sesiones en otros dispositivos." };
}

export function useUserSettings(open: boolean, onProfileIdentityChange?: (payload: { firstName: string; lastName: string }) => void) {
  const { setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [isPending, startTransition] = useTransition();
  const [profile, setProfile] = useState<ProfileForm>(initialProfile);
  const [profileSnapshot, setProfileSnapshot] = useState<ProfileForm>(initialProfile);
  const [system, setSystem] = useState<SystemForm>(initialSystem);
  const [createAccount, setCreateAccount] = useState<CreateSuperAdminForm>(initialCreate);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [auditFeed, setAuditFeed] = useState<AuditFeedRow[]>([]);
  const [profileErrors, setProfileErrors] = useState<ProfileFieldErrors>({});
  const [createErrors, setCreateErrors] = useState<CreateAccountFieldErrors>({});
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [closeSessionsPromptOpen, setCloseSessionsPromptOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<SensitiveAction | null>(null);
  const hasProfileChanges =
    profile.firstName !== profileSnapshot.firstName ||
    profile.lastName !== profileSnapshot.lastName ||
    profile.birthDate !== profileSnapshot.birthDate ||
    profile.phone !== profileSnapshot.phone ||
    profile.ci !== profileSnapshot.ci ||
    profile.profession !== profileSnapshot.profession ||
    profile.photoUrl !== profileSnapshot.photoUrl ||
    profile.aboutMe !== profileSnapshot.aboutMe ||
    profile.skills !== profileSnapshot.skills ||
    profile.languages !== profileSnapshot.languages ||
    profile.username !== profileSnapshot.username ||
    Boolean(profile.newPassword) ||
    Boolean(profile.newPasswordConfirm);
  const canSubmitProfile = !isPending && hasProfileChanges;

  useEffect(() => {
    if (!open) return;
    setIsEditingCredentials(false);
    startTransition(async () => {
      const [profileRes, systemRes, sessionsRes, auditRes] = await Promise.all([getSuperAdminProfileAction(), getSuperAdminSystemSettingsAction(), getRecentSuperAdminSessionsAction(), getSuperAdminAuditFeedAction()]);
      if (profileRes.success && profileRes.data) {
        const hydratedProfile = { ...initialProfile, ...profileRes.data, initialUsername: profileRes.data.username };
        setProfile(hydratedProfile);
        setProfileSnapshot(hydratedProfile);
      }
      if (systemRes.success && systemRes.data) setSystem((prev) => ({ ...prev, ...systemRes.data }));
      if (sessionsRes.success && sessionsRes.data) setSessions(sessionsRes.data);
      if (auditRes.success && "data" in auditRes && auditRes.data) setAuditFeed(auditRes.data);
      if (!profileRes.success || !systemRes.success) toast.error("No se pudo cargar configuracion");
    });
  }, [open]);

  const requestConfirmation = (action: SensitiveAction) => {
    setPendingAction(action);
    setConfirmError(null);
    setConfirmOpen(true);
  };

  const saveProfile = () => {
    if (!hasProfileChanges) return toast.info("No hay cambios para guardar");
    const errors = validateProfile(profile, profileSnapshot);
    setProfileErrors(errors);
    if (Object.keys(errors).length) return toast.error("Corrige los datos del perfil");
    requestConfirmation("profile");
  };

  const saveSystem = () => {
    requestConfirmation("system");
  };

  const createSuperAdmin = () => {
    const errors = validateCreateAccount(createAccount);
    setCreateErrors(errors);
    if (Object.keys(errors).length) return toast.error("Corrige la cuenta a crear");
    requestConfirmation("createAccount");
  };

  const revokeOtherSessions = () => {
    setCloseSessionsPromptOpen(true);
  };
  const confirmCloseOtherSessions = () => {
    setCloseSessionsPromptOpen(false);
    requestConfirmation("revokeSessions");
  };

  const confirmSensitiveAction = (password: string) => startTransition(async () => {
    if (!pendingAction) return;

    const runResult = pendingAction === "profile"
      ? await updateSuperAdminProfileAction({ ...profile, currentPassword: password })
      : pendingAction === "system"
        ? await updateSuperAdminSystemSettingsAction({ ...system, currentPassword: password })
        : pendingAction === "createAccount"
          ? await createSuperAdminAccountAction({ ...createAccount, currentPassword: password })
          : await revokeOtherSuperAdminSessionsAction({ currentPassword: password });

    if (!runResult.success) {
      setConfirmError(runResult.error || "No se pudo completar la accion");
      return;
    }

    setConfirmError(null);
    setConfirmOpen(false);

    if (pendingAction === "profile") {
      onProfileIdentityChange?.({ firstName: profile.firstName, lastName: profile.lastName });
      setIsEditingCredentials(false);
      const nextProfile = { ...profile, initialUsername: profile.username, newPassword: "", newPasswordConfirm: "" };
      setProfile(nextProfile);
      setProfileSnapshot(nextProfile);
      toast.success("Perfil actualizado");
    }
    if (pendingAction === "system") {
      setTheme(system.theme);
      toast.success("Configuracion guardada");
    }
    if (pendingAction === "createAccount") {
      setCreateAccount(initialCreate);
      toast.success("Nuevo superadmin creado");
    }
    if (pendingAction === "revokeSessions") {
      const closed = "count" in runResult ? runResult.count : 0;
      toast.success(`Se cerraron ${closed} sesiones`);
    }

    const [sessionsRes, auditRes] = await Promise.all([getRecentSuperAdminSessionsAction(), getSuperAdminAuditFeedAction()]);
    if (sessionsRes.success && sessionsRes.data) setSessions(sessionsRes.data);
    if (auditRes.success && "data" in auditRes && auditRes.data) setAuditFeed(auditRes.data);
  });

  const confirmMeta = getConfirmMeta(pendingAction);

  return {
    activeTab, setActiveTab, isPending, profile, setProfile, system, setSystem, createAccount, setCreateAccount, sessions, auditFeed,
    profileSnapshot,
    profileErrors, setProfileErrors, createErrors, setCreateErrors, isEditingCredentials, setIsEditingCredentials, canSubmitProfile,
    saveProfile, saveSystem, createSuperAdmin, revokeOtherSessions,
    closeSessionsPromptOpen, setCloseSessionsPromptOpen, confirmCloseOtherSessions,
    confirmOpen, setConfirmOpen, confirmError, confirmTitle: confirmMeta.title, confirmDescription: confirmMeta.description, confirmSensitiveAction,
  };
}
