"use client";

import { useState } from "react";

import { Bell, MonitorCog, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ConfirmActionDialog } from "@/components/super-admin/dashboard/layout/navigation/user-settings/dialogs/confirm-action-dialog";
import { ConfirmPasswordDialog } from "@/components/super-admin/dashboard/layout/navigation/user-settings/dialogs/confirm-password-dialog";
import { useUserSettings } from "@/components/super-admin/dashboard/layout/navigation/user-settings/hooks";
import {
  AccountSecurityTab,
  NotificationsTab,
  SystemTab,
} from "@/components/super-admin/dashboard/layout/navigation/user-settings/tabs";

type SettingsTabId = "notifications" | "system" | "account-security";

const tabs: Array<{ id: SettingsTabId; label: string; icon: LucideIcon }> = [
  { id: "system", label: "Sistema", icon: MonitorCog },
  { id: "notifications", label: "Notificaciones", icon: Bell },
  { id: "account-security", label: "Seguridad", icon: Shield },
];

export function SettingsPage() {
  const state = useUserSettings(true);
  const [activeTab, setActiveTab] = useState<SettingsTabId>("system");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-2 rounded-xl border border-border/60 bg-card/80 p-3 shadow-sm">
          <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Configuracion</p>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                  activeTab === tab.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
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
