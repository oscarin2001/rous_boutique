"use client";

import { useEffect } from "react";
import { useState } from "react";

import { Bell, Settings, ShieldCheck, UserCog } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { ConfirmActionDialog } from "./confirm-action-dialog";
import { ConfirmPasswordDialog } from "./confirm-password-dialog";
import { useUserSettings } from "../hooks";
import {
  AccountSecurityTab,
  AuditTab,
  NotificationsTab,
  ProfileTab,
  SuperadminsTab,
  SystemTab,
} from "../tabs";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryPoint?: "profile-view" | "profile-edit" | "settings";
  onProfileIdentityChange?: (payload: { firstName: string; lastName: string }) => void;
};

export function UserSettingsDialog({ open, onOpenChange, entryPoint = "settings", onProfileIdentityChange }: Props) {
  const state = useUserSettings(open, onProfileIdentityChange);
  const [profileEditable, setProfileEditable] = useState(false);
  const { setActiveTab, setIsEditingCredentials } = state;

  const tabMenu = [
    { id: "profile" as const, label: "Perfil", hint: "Identidad y cuenta", icon: UserCog },
    { id: "notifications" as const, label: "Notificaciones", hint: "Alertas y avisos", icon: Bell },
    { id: "system" as const, label: "Sistema", hint: "Preferencias operativas", icon: Settings },
    { id: "account-security" as const, label: "Seguridad de cuenta", hint: "Sesiones y accesos", icon: ShieldCheck },
    { id: "superadmins" as const, label: "Superadmins", hint: "Administracion de cuentas", icon: ShieldCheck },
    { id: "audit" as const, label: "Auditoria", hint: "Actividad y trazabilidad", icon: ShieldCheck },
  ];

  const tabStatus: Record<(typeof tabMenu)[number]["id"], string> = {
    profile: profileEditable ? "Edicion" : "Solo lectura",
    notifications: "Activo",
    system: "Configurable",
    "account-security": "Protegido",
    superadmins: "Administrable",
    audit: "Trazable",
  };

  useEffect(() => {
    if (!open) return;

    if (entryPoint === "profile-edit") {
      setActiveTab("profile");
      setIsEditingCredentials(false);
      setProfileEditable(true);
      return;
    }

    if (entryPoint === "profile-view") {
      setActiveTab("profile");
      setIsEditingCredentials(false);
      setProfileEditable(false);
      return;
    }

    setActiveTab("system");
    setIsEditingCredentials(false);
    setProfileEditable(false);
  }, [open, entryPoint, setActiveTab, setIsEditingCredentials]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide overflow-hidden p-0 ring-1 ring-border/30">
        <DialogHeader className="sticky top-0 z-10 border-b border-border/40 bg-card/95 px-5 py-4 backdrop-blur">
          <DialogTitle className="flex items-center gap-2"><Settings className="size-4" />Centro de configuracion superadmin</DialogTitle>
        </DialogHeader>
        <div className="grid min-h-[560px] grid-cols-[230px_1fr] bg-gradient-to-b from-muted/10 to-transparent">
          <aside className="border-r border-border/40 bg-muted/10 p-3">
            <p className="px-2 pb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Configuracion</p>
            <div className="space-y-1">
              {tabMenu.map((item) => {
                const Icon = item.icon;
                const isActive = state.activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left text-sm ${isActive ? "border-primary/25 bg-primary/8" : "border-transparent hover:bg-muted"}`}
                    onClick={() => state.setActiveTab(item.id)}
                  >
                    <Icon className={`mt-0.5 size-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="grid flex-1">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.hint}</span>
                    </span>
                    <span className={`mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {tabStatus[item.id]}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
          <section className="overflow-y-auto p-5">
            {state.activeTab === "profile" ? (
              <ProfileTab
                profile={state.profile}
                profileErrors={state.profileErrors}
                isEditingCredentials={state.isEditingCredentials}
                isEditable={profileEditable}
                setIsEditingCredentials={state.setIsEditingCredentials}
                canSubmitProfile={state.canSubmitProfile}
                setProfile={state.setProfile}
                setProfileErrors={state.setProfileErrors}
                onSave={state.saveProfile}
              />
            ) : null}
            {state.activeTab === "notifications" ? (
              <NotificationsTab
                system={state.system}
                isPending={state.isPending}
                setSystem={state.setSystem}
                onSave={state.saveSystem}
              />
            ) : null}
            {state.activeTab === "system" ? <SystemTab system={state.system} isPending={state.isPending} setSystem={state.setSystem} onSave={state.saveSystem} /> : null}
            {state.activeTab === "account-security" ? (
              <AccountSecurityTab
                sessions={state.sessions}
                isPending={state.isPending}
                onRevokeOther={state.revokeOtherSessions}
              />
            ) : null}
            {state.activeTab === "superadmins" ? (
              <SuperadminsTab
                form={state.createAccount}
                errors={state.createErrors}
                isPending={state.isPending}
                setForm={state.setCreateAccount}
                setErrors={state.setCreateErrors}
                onCreate={state.createSuperAdmin}
              />
            ) : null}
            {state.activeTab === "audit" ? <AuditTab auditFeed={state.auditFeed} /> : null}
          </section>
        </div>
      </DialogContent>
      <ConfirmPasswordDialog
        open={state.confirmOpen}
        title={state.confirmTitle}
        description={state.confirmDescription}
        isPending={state.isPending}
        error={state.confirmError}
        onOpenChange={state.setConfirmOpen}
        onConfirm={state.confirmSensitiveAction}
      />
      <ConfirmActionDialog open={state.closeSessionsPromptOpen} onOpenChange={state.setCloseSessionsPromptOpen} onConfirm={state.confirmCloseOtherSessions} />
    </Dialog>
  );
}
