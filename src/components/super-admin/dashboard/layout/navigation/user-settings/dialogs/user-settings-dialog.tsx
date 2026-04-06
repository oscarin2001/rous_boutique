"use client";

import { useEffect, useState } from "react";

import {
  Activity,
  Bell,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
} from "lucide-react";

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

const tabMenu = [
  { id: "profile" as const, label: "Perfil", icon: UserCog },
  { id: "notifications" as const, label: "Notificaciones", icon: Bell },
  { id: "system" as const, label: "Sistema", icon: SlidersHorizontal },
  { id: "account-security" as const, label: "Seguridad", icon: ShieldCheck },
  { id: "superadmins" as const, label: "Super Admins", icon: Users },
  { id: "audit" as const, label: "Auditoría", icon: Activity },
] as const;

export function UserSettingsDialog({
  open,
  onOpenChange,
  entryPoint = "settings",
  onProfileIdentityChange,
}: Props) {
  const state = useUserSettings(open, onProfileIdentityChange);
  const [profileEditable, setProfileEditable] = useState(false);

  const { setActiveTab, setIsEditingCredentials, activeTab } = state;

  // Manejo de entryPoint
  useEffect(() => {
    if (!open) return;

    switch (entryPoint) {
      case "profile-edit":
        setActiveTab("profile");
        setIsEditingCredentials(false);
        setProfileEditable(true);
        break;

      case "profile-view":
        setActiveTab("profile");
        setIsEditingCredentials(false);
        setProfileEditable(false);
        break;

      default:
        setActiveTab("system");
        setIsEditingCredentials(false);
        setProfileEditable(false);
        break;
    }
  }, [open, entryPoint, setActiveTab, setIsEditingCredentials]);

  const currentTab = tabMenu.find((tab) => tab.id === activeTab);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide overflow-hidden p-0 ring-1 ring-border/30">
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 border-b border-border bg-card px-6 py-5 backdrop-blur-xl">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
            <Settings className="size-5 text-primary" />
            Centro de Configuración
            {currentTab && (
              <span className="text-base font-normal text-muted-foreground">• {currentTab.label}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid min-h-[560px] grid-cols-[240px_1fr]">
          {/* Sidebar limpia y profesional */}
          <aside className="border-r border-border bg-muted/30 p-4">
            <div className="mb-6 px-3">
              <p className="text-[10px] font-semibold uppercase tracking-[1px] text-muted-foreground">
                CONFIGURACIÓN
              </p>
            </div>

            <nav className="space-y-1">
              {tabMenu.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className={`size-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Contenido principal */}
          <section className="overflow-y-auto bg-card p-8">
            {activeTab === "profile" && (
              <ProfileTab
                profile={state.profile}
                profileSnapshot={state.profileSnapshot}
                profileErrors={state.profileErrors}
                isPending={state.isPending}
                isEditingCredentials={state.isEditingCredentials}
                isEditable={profileEditable}
                setIsEditingCredentials={state.setIsEditingCredentials}
                setProfile={state.setProfile}
                setProfileErrors={state.setProfileErrors}
                onSave={state.saveProfile}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationsTab
                system={state.system}
                isPending={state.isPending}
                setSystem={state.setSystem}
                onSave={state.saveSystem}
              />
            )}

            {activeTab === "system" && (
              <SystemTab
                system={state.system}
                isPending={state.isPending}
                setSystem={state.setSystem}
                onSave={state.saveSystem}
              />
            )}

            {activeTab === "account-security" && (
              <AccountSecurityTab
                sessions={state.sessions}
                isPending={state.isPending}
                onRevokeOther={state.revokeOtherSessions}
              />
            )}

            {activeTab === "superadmins" && (
              <SuperadminsTab
                form={state.createAccount}
                errors={state.createErrors}
                isPending={state.isPending}
                setForm={state.setCreateAccount}
                setErrors={state.setCreateErrors}
                onCreate={state.createSuperAdmin}
              />
            )}

            {activeTab === "audit" && <AuditTab auditFeed={state.auditFeed} />}
          </section>
        </div>
      </DialogContent>

      {/* Diálogos de confirmación */}
      <ConfirmPasswordDialog
        open={state.confirmOpen}
        title={state.confirmTitle}
        description={state.confirmDescription}
        isPending={state.isPending}
        error={state.confirmError}
        onOpenChange={state.setConfirmOpen}
        onConfirm={state.confirmSensitiveAction}
      />

      <ConfirmActionDialog
        open={state.closeSessionsPromptOpen}
        onOpenChange={state.setCloseSessionsPromptOpen}
        onConfirm={state.confirmCloseOtherSessions}
      />
    </Dialog>
  );
}