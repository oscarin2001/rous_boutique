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

const initialProfile: ProfileForm = { firstName: "", lastName: "", birthDate: "", phone: "", ci: "", initialUsername: "", username: "", newPassword: "", newPasswordConfirm: "", lastLogin: null, canChangeCredentials: true, lastCredentialChangeAt: null, nextCredentialChangeAt: null };
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingAction, setPendingAction] = useState<SensitiveAction | null>(null);
  const canSubmitProfile = !isPending && (!!profile.firstName || !!profile.lastName);

  useEffect(() => {
    if (!open) return;
    setIsEditMode(false);
    startTransition(async () => {
      const [profileRes, systemRes, sessionsRes, auditRes] = await Promise.all([getSuperAdminProfileAction(), getSuperAdminSystemSettingsAction(), getRecentSuperAdminSessionsAction(), getSuperAdminAuditFeedAction()]);
      if (profileRes.success && profileRes.data) setProfile({ ...initialProfile, ...profileRes.data, initialUsername: profileRes.data.username });
      if (systemRes.success && systemRes.data) setSystem((prev) => ({ ...prev, ...systemRes.data }));
      if (sessionsRes.success && sessionsRes.data) setSessions(sessionsRes.data);
      if (auditRes.success && "data" in auditRes && auditRes.data) setAuditFeed(auditRes.data);
      if (!profileRes.success || !systemRes.success) toast.error("No se pudo cargar configuracion");
    });
  }, [open]);

  const changeTab = (tab: TabId) => {
    setActiveTab(tab);
    setIsEditMode(false);
  };

  const requestConfirmation = (action: SensitiveAction) => {
    setPendingAction(action);
    setConfirmError(null);
    setConfirmOpen(true);
  };

  const saveProfile = () => {
    if (!isEditMode) return toast.info("Activa modo edicion para modificar datos");
    const errors = validateProfile(profile);
    setProfileErrors(errors);
    if (Object.keys(errors).length) return toast.error("Corrige los datos del perfil");
    requestConfirmation("profile");
  };

  const saveSystem = () => {
    if (!isEditMode) return toast.info("Activa modo edicion para modificar datos");
    requestConfirmation("system");
  };

  const createSuperAdmin = () => {
    if (!isEditMode) return toast.info("Activa modo edicion para ejecutar cambios de seguridad");
    const errors = validateCreateAccount(createAccount);
    setCreateErrors(errors);
    if (Object.keys(errors).length) return toast.error("Corrige la cuenta a crear");
    requestConfirmation("createAccount");
  };

  const revokeOtherSessions = () => {
    if (!isEditMode) return toast.info("Activa modo edicion para ejecutar cambios de seguridad");
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
    setIsEditMode(false);

    if (pendingAction === "profile") {
      onProfileIdentityChange?.({ firstName: profile.firstName, lastName: profile.lastName });
      setIsEditingCredentials(false);
      setProfile((v) => ({ ...v, initialUsername: v.username, newPassword: "", newPasswordConfirm: "" }));
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
    activeTab, setActiveTab: changeTab, isPending, profile, setProfile, system, setSystem, createAccount, setCreateAccount, sessions, auditFeed,
    profileErrors, setProfileErrors, createErrors, setCreateErrors, isEditingCredentials, setIsEditingCredentials, canSubmitProfile,
    saveProfile, saveSystem, createSuperAdmin, revokeOtherSessions,
    isEditMode, setIsEditMode, closeSessionsPromptOpen, setCloseSessionsPromptOpen, confirmCloseOtherSessions,
    confirmOpen, setConfirmOpen, confirmError, confirmTitle: confirmMeta.title, confirmDescription: confirmMeta.description, confirmSensitiveAction,
  };
}
