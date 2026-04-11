"use client";

import { useEffect, useState, useTransition } from "react";

import { useTheme } from "next-themes";
import { toast } from "sonner";

import {
  createSuperAdminAccountAction,
  getSuperAdminAuditFeedAction,
  getRecentSuperAdminSessionsAction,
  getSuperAdminSystemSettingsAction,
  revokeOtherSuperAdminSessionsAction,
  updateSuperAdminSystemSettingsAction,
} from "@/actions/super-admin/user-settings/actions";

import { validateCreateAccount } from "../core";
import type {
  AuditFeedRow,
  CreateAccountFieldErrors,
  CreateSuperAdminForm,
  SensitiveAction,
  SessionRow,
  SystemForm,
  TabId,
} from "../core";

const initialSystem: SystemForm = { theme: "system", language: "es", notifications: true, timezone: "America/La_Paz", dateFormat: "DD/MM/YYYY", timeFormat: "24h", currency: "BOB", sessionTtlMinutes: 480, emergencyPhone: "", emergencyContactName: "", emergencyContactPhone: "", signatureDisplayName: "", signatureTitle: "", notificationChannels: { login: true, create: true, update: true, delete: true, security: true } };
const initialCreate: CreateSuperAdminForm = { firstName: "", lastName: "", birthDate: "", ci: "", phone: "", username: "", password: "", passwordConfirm: "" };

function getConfirmMeta(action: SensitiveAction | null) {
  if (action === "system") return { title: "Confirmar cambios de sistema", description: "Ingresa tu contrasena actual para actualizar configuracion operativa." };
  if (action === "createAccount") return { title: "Confirmar creacion de superadmin", description: "Ingresa tu contrasena actual para autorizar la nueva cuenta." };
  return { title: "Confirmar cierre de sesiones", description: "Ingresa tu contrasena actual para revocar sesiones en otros dispositivos." };
}

export function useUserSettings(open: boolean) {
  const { setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>("system");
  const [isPending, startTransition] = useTransition();
  const [system, setSystem] = useState<SystemForm>(initialSystem);
  const [createAccount, setCreateAccount] = useState<CreateSuperAdminForm>(initialCreate);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [auditFeed, setAuditFeed] = useState<AuditFeedRow[]>([]);
  const [createErrors, setCreateErrors] = useState<CreateAccountFieldErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [closeSessionsPromptOpen, setCloseSessionsPromptOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<SensitiveAction | null>(null);

  useEffect(() => {
    if (!open) return;
    setActiveTab("system");
    startTransition(async () => {
      const [systemRes, sessionsRes, auditRes] = await Promise.all([getSuperAdminSystemSettingsAction(), getRecentSuperAdminSessionsAction(), getSuperAdminAuditFeedAction()]);
      if (systemRes.success && systemRes.data) setSystem((prev) => ({ ...prev, ...systemRes.data }));
      if (sessionsRes.success && sessionsRes.data) setSessions(sessionsRes.data);
      if (auditRes.success && "data" in auditRes && auditRes.data) setAuditFeed(auditRes.data);
      if (!systemRes.success) toast.error("No se pudo cargar configuracion");
    });
  }, [open]);

  const requestConfirmation = (action: SensitiveAction) => {
    setPendingAction(action);
    setConfirmError(null);
    setConfirmOpen(true);
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

    const runResult = pendingAction === "system"
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
    activeTab,
    setActiveTab,
    isPending,
    system,
    setSystem,
    createAccount,
    setCreateAccount,
    sessions,
    auditFeed,
    createErrors,
    setCreateErrors,
    saveSystem,
    createSuperAdmin,
    revokeOtherSessions,
    closeSessionsPromptOpen, setCloseSessionsPromptOpen, confirmCloseOtherSessions,
    confirmOpen, setConfirmOpen, confirmError, confirmTitle: confirmMeta.title, confirmDescription: confirmMeta.description, confirmSensitiveAction,
  };
}
