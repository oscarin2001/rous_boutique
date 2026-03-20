"use client";

import { Bell, Settings, ShieldCheck, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { ConfirmActionDialog } from "./confirm-action-dialog";
import { ConfirmPasswordDialog } from "./confirm-password-dialog";
import { useUserSettings } from "../hooks";
import { ProfileTab, SecurityTab, SystemTab } from "../tabs";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileIdentityChange?: (payload: { firstName: string; lastName: string }) => void;
};

export function UserSettingsDialog({ open, onOpenChange, onProfileIdentityChange }: Props) {
  const state = useUserSettings(open, onProfileIdentityChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sa-modal-wide overflow-hidden p-0">
        <DialogHeader className="bg-muted/20 px-5 py-4">
          <DialogTitle className="flex items-center gap-2"><Settings className="size-4" />Configuracion de superadmin</DialogTitle>
        </DialogHeader>
        <div className="grid min-h-[500px] grid-cols-[180px_1fr] bg-gradient-to-b from-muted/10 to-transparent">
          <aside className="bg-muted/10 p-2">
            <button type="button" className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${state.activeTab === "profile" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => state.setActiveTab("profile")}><UserCog className="size-4" />Perfil</button>
            <button type="button" className={`mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${state.activeTab === "system" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => state.setActiveTab("system")}><Bell className="size-4" />Sistema</button>
            <button type="button" className={`mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${state.activeTab === "security" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => state.setActiveTab("security")}><ShieldCheck className="size-4" />Seguridad</button>
          </aside>
          <section className="p-5">
            <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <p>{state.isEditMode ? "Modo edicion activo: podras aplicar cambios sensibles." : "Vista protegida: primero habilita modo edicion para modificar."}</p>
              <Button type="button" size="sm" variant={state.isEditMode ? "outline" : "default"} onClick={() => state.setIsEditMode(!state.isEditMode)}>
                {state.isEditMode ? "Bloquear edicion" : "Habilitar edicion"}
              </Button>
            </div>
            {state.activeTab === "profile" ? (
              <ProfileTab
                profile={state.profile}
                profileErrors={state.profileErrors}
                isEditingCredentials={state.isEditingCredentials}
                setIsEditingCredentials={state.setIsEditingCredentials}
                canSubmitProfile={state.canSubmitProfile}
                isEditMode={state.isEditMode}
                setProfile={state.setProfile}
                setProfileErrors={state.setProfileErrors}
                onSave={state.saveProfile}
              />
            ) : null}
            {state.activeTab === "system" ? <SystemTab system={state.system} isPending={state.isPending} isEditMode={state.isEditMode} setSystem={state.setSystem} onSave={state.saveSystem} /> : null}
            {state.activeTab === "security" ? (
              <SecurityTab
                form={state.createAccount}
                errors={state.createErrors}
                sessions={state.sessions}
                auditFeed={state.auditFeed}
                isPending={state.isPending}
                isEditMode={state.isEditMode}
                setForm={state.setCreateAccount}
                setErrors={state.setCreateErrors}
                onCreate={state.createSuperAdmin}
                onRevokeOther={state.revokeOtherSessions}
              />
            ) : null}
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
