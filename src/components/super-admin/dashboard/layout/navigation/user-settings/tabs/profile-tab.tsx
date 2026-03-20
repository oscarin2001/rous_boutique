"use client";

import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

import { InfoHint } from "../components";
import type { ProfileFieldErrors, ProfileForm } from "../core";

type Props = {
  profile: ProfileForm;
  profileErrors: ProfileFieldErrors;
  isEditingCredentials: boolean;
  isEditMode: boolean;
  setIsEditingCredentials: (value: boolean) => void;
  canSubmitProfile: boolean;
  setProfile: (updater: (prev: ProfileForm) => ProfileForm) => void;
  setProfileErrors: (updater: (prev: ProfileFieldErrors) => ProfileFieldErrors) => void;
  onSave: () => void;
};

export function ProfileTab({ profile, profileErrors, isEditingCredentials, isEditMode, setIsEditingCredentials, canSubmitProfile, setProfile, setProfileErrors, onSave }: Props) {
  const clear = (key: keyof ProfileFieldErrors) => setProfileErrors((v) => ({ ...v, [key]: undefined }));
  const cancelCredentialEdition = () => {
    setProfile((v) => ({ ...v, username: v.initialUsername, newPassword: "", newPasswordConfirm: "" }));
    setIsEditingCredentials(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 rounded-xl bg-card/80 p-4 shadow-sm ring-1 ring-border/40">
        <p className="col-span-2 flex items-center gap-1 text-xs text-muted-foreground">Datos personales de tu cuenta superadmin. <InfoHint text="Estos datos actualizan nombre, apellido, CI, telefono y fecha de nacimiento usados en perfil y auditoria." /></p>
        <div><Label htmlFor="firstName">Nombre</Label><Input id="firstName" disabled={!isEditMode} value={profile.firstName} onChange={(e) => { setProfile((v) => ({ ...v, firstName: e.target.value })); clear("firstName"); }} />{profileErrors.firstName ? <p className="mt-1 text-xs text-destructive">{profileErrors.firstName}</p> : null}</div>
        <div><Label htmlFor="lastName">Apellido</Label><Input id="lastName" disabled={!isEditMode} value={profile.lastName} onChange={(e) => { setProfile((v) => ({ ...v, lastName: e.target.value })); clear("lastName"); }} />{profileErrors.lastName ? <p className="mt-1 text-xs text-destructive">{profileErrors.lastName}</p> : null}</div>
        <div><Label htmlFor="birthDate">Fecha de nacimiento</Label><DateInput id="birthDate" disabled={!isEditMode} max={new Date().toISOString().slice(0, 10)} value={profile.birthDate} onValueChange={(value) => { setProfile((v) => ({ ...v, birthDate: value })); clear("birthDate"); }} />{profileErrors.birthDate ? <p className="mt-1 text-xs text-destructive">{profileErrors.birthDate}</p> : null}</div>
        <div><Label htmlFor="phone">Telefono</Label><Input id="phone" disabled={!isEditMode} value={profile.phone} onChange={(e) => { setProfile((v) => ({ ...v, phone: e.target.value.replace(/\D/g, "").slice(0, 8) })); clear("phone"); }} />{profileErrors.phone ? <p className="mt-1 text-xs text-destructive">{profileErrors.phone}</p> : null}</div>
        <div><Label htmlFor="ci">CI</Label><Input id="ci" disabled={!isEditMode} value={profile.ci} onChange={(e) => { setProfile((v) => ({ ...v, ci: e.target.value.slice(0, 20) })); clear("ci"); }} />{profileErrors.ci ? <p className="mt-1 text-xs text-destructive">{profileErrors.ci}</p> : null}</div>
      </div>

      <div className="space-y-2 rounded-xl bg-card/80 p-4 shadow-sm ring-1 ring-border/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-sm font-medium">Credenciales del superadmin <InfoHint text="El usuario actual se muestra, pero nunca la contrasena. Solo puedes cambiar credenciales cada 3 meses." /></p>
          {profile.canChangeCredentials ? <Button type="button" variant="outline" size="sm" disabled={!isEditMode} onClick={() => (isEditingCredentials ? cancelCredentialEdition() : setIsEditingCredentials(true))}>{isEditingCredentials ? "Cancelar edicion" : "Editar credenciales"}</Button> : null}
        </div>
        <p className="text-xs text-muted-foreground">Al guardar, se abrira una ventana emergente para confirmar con tu contrasena actual.</p>
        <div><Label htmlFor="currentUsername">Usuario actual</Label><Input id="currentUsername" value={profile.initialUsername} disabled readOnly /><p className="mt-1 text-xs text-muted-foreground">La contrasena actual nunca se muestra por seguridad.</p></div>
        {isEditingCredentials && profile.canChangeCredentials ? (
          <div className="space-y-3">
            <div><Label htmlFor="username">Nuevo usuario</Label><Input id="username" disabled={!isEditMode} value={profile.username} onChange={(e) => { setProfile((v) => ({ ...v, username: e.target.value.toLowerCase() })); clear("username"); }} />{profileErrors.username ? <p className="mt-1 text-xs text-destructive">{profileErrors.username}</p> : null}</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><Label htmlFor="newPassword">Nueva contrasena</Label><PasswordInput id="newPassword" disabled={!isEditMode} value={profile.newPassword} onChange={(e) => { setProfile((v) => ({ ...v, newPassword: e.target.value })); clear("newPassword"); }} />{profileErrors.newPassword ? <p className="mt-1 text-xs text-destructive">{profileErrors.newPassword}</p> : null}</div>
              <div><Label htmlFor="newPasswordConfirm">Confirmar nueva contrasena</Label><PasswordInput id="newPasswordConfirm" disabled={!isEditMode} value={profile.newPasswordConfirm} onChange={(e) => { setProfile((v) => ({ ...v, newPasswordConfirm: e.target.value })); clear("newPasswordConfirm"); }} />{profileErrors.newPasswordConfirm ? <p className="mt-1 text-xs text-destructive">{profileErrors.newPasswordConfirm}</p> : null}</div>
            </div>
          </div>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">Ultimo acceso: {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString("es-BO") : "Sin registro"}</p>
      <Button type="button" onClick={onSave} disabled={!isEditMode || !canSubmitProfile}>Guardar perfil</Button>
    </div>
  );
}
