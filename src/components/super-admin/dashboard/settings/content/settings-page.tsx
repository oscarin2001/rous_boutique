"use client";

import { useState } from "react";

import { SlidersHorizontal } from "lucide-react";

import { ConfirmActionDialog } from "@/components/super-admin/dashboard/layout/navigation/user-settings/dialogs/confirm-action-dialog";
import { ConfirmPasswordDialog } from "@/components/super-admin/dashboard/layout/navigation/user-settings/dialogs/confirm-password-dialog";
import { useUserSettings } from "@/components/super-admin/dashboard/layout/navigation/user-settings/hooks";
import {
  AccountSecurityTab,
  NotificationsTab,
  SystemTab,
} from "@/components/super-admin/dashboard/layout/navigation/user-settings/tabs";
import { PageHeaderCard } from "@/components/super-admin/dashboard/shared/page-header-card";

type SettingsTabId = "notifications" | "system" | "account-security";

const tabs: Array<{ id: SettingsTabId; label: string }> = [
  { id: "system", label: "Sistema" },
  { id: "notifications", label: "Notificaciones" },
  { id: "account-security", label: "Seguridad" },
];

export function SettingsPage() {
  const state = useUserSettings(true);
  const [activeTab, setActiveTab] = useState<SettingsTabId>("system");

  return (
    <div className="space-y-6">
      <PageHeaderCard
        icon={SlidersHorizontal}
        eyebrow="Configuracion"
        title="Centro de configuracion"
        description="Administra ajustes operativos, notificaciones y seguridad con una experiencia consistente."
      />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-2 rounded-xl bg-card/80 p-3">
          <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Secciones</p>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                activeTab === tab.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        <section className="rounded-2xl bg-card/80 p-6">
          {activeTab === "system" && (
            <SystemTab
              system={state.system}
              isPending={state.isPending}
              setSystem={state.setSystem}
              onSave={state.saveSystem}
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

          {activeTab === "account-security" && (
            <AccountSecurityTab
              sessions={state.sessions}
              isPending={state.isPending}
              onRevokeOther={state.revokeOtherSessions}
            />
          )}
        </section>
      </div>

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
    </div>
  );
}
