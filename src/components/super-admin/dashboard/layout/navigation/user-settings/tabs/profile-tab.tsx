"use client";

import { type ChangeEvent, useRef, useState } from "react";

import { Camera, Save } from "lucide-react";
import { toast } from "sonner";

import { uploadSuperAdminProfilePhotoAction } from "@/actions/super-admin/user-settings/actions";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { InfoHint } from "../components";
import type { ProfileFieldErrors, ProfileForm } from "../core";

type Props = {
  profile: ProfileForm;
  profileSnapshot: ProfileForm;
  profileErrors: ProfileFieldErrors;
  isPending: boolean;
  isEditingCredentials: boolean;
  isEditable: boolean;
  setIsEditingCredentials: (value: boolean) => void;
  setProfile: (updater: (prev: ProfileForm) => ProfileForm) => void;
  setProfileErrors: (updater: (prev: ProfileFieldErrors) => ProfileFieldErrors) => void;
  onSave: () => void;
};

export function ProfileTab({
  profile,
  profileSnapshot,
  profileErrors,
  isPending,
  isEditingCredentials,
  isEditable,
  setIsEditingCredentials,
  setProfile,
  setProfileErrors,
  onSave,
}: Props) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const clearError = (key: keyof ProfileFieldErrors) =>
    setProfileErrors((prev) => ({ ...prev, [key]: undefined }));

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const result = await uploadSuperAdminProfilePhotoAction(file);
    setIsUploadingPhoto(false);
    e.target.value = "";

    if (!result.success || !result.data) {
      toast.error(result.error ?? "No se pudo subir la foto de perfil");
      return;
    }

    setProfile((prev) => ({ ...prev, photoUrl: result.data.photoUrl }));
    clearError("photoUrl");
    toast.success("Foto de perfil actualizada correctamente");
  };

  const hasChanges = 
    profile.firstName !== profileSnapshot.firstName ||
    profile.lastName !== profileSnapshot.lastName ||
    profile.birthDate !== profileSnapshot.birthDate ||
    profile.phone !== profileSnapshot.phone ||
    profile.ci !== profileSnapshot.ci ||
    profile.profession !== profileSnapshot.profession ||
    profile.aboutMe !== profileSnapshot.aboutMe ||
    profile.skills !== profileSnapshot.skills ||
    profile.languages !== profileSnapshot.languages ||
    profile.username !== profileSnapshot.username ||
    Boolean(profile.newPassword) ||
    Boolean(profile.newPasswordConfirm) ||
    profile.photoUrl !== profileSnapshot.photoUrl;

  const displayName = `${profile.firstName} ${profile.lastName}`.trim() || "Super Admin";

  return (
    <div className="space-y-10">
      {/* Sección: Información Personal */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Información Personal</h2>
            <p className="text-sm text-muted-foreground">Datos de identidad y contacto</p>
          </div>
          {isEditable && hasChanges && (
            <Button onClick={onSave} disabled={isPending} className="gap-2">
              <Save className="size-4" />
              Guardar cambios
            </Button>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-8">
          {/* Foto de perfil */}
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="relative group">
              <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                <AvatarImage src={profile.photoUrl} alt={displayName} />
                <AvatarFallback className="text-4xl font-medium bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              {isEditable && (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
                  disabled={isUploadingPhoto}
                >
                  <Camera className="size-4" />
                </button>
              )}
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handlePhotoUpload}
            />

            <div className="text-center">
              <p className="font-medium">{displayName}</p>
              <p className="text-sm text-muted-foreground">{profile.profession || "Super Admin"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                disabled={!isEditable}
                onChange={(e) => {
                  setProfile((v) => ({ ...v, firstName: e.target.value }));
                  clearError("firstName");
                }}
              />
              {profileErrors.firstName && (
                <p className="text-xs text-destructive">{profileErrors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                disabled={!isEditable}
                onChange={(e) => {
                  setProfile((v) => ({ ...v, lastName: e.target.value }));
                  clearError("lastName");
                }}
              />
              {profileErrors.lastName && (
                <p className="text-xs text-destructive">{profileErrors.lastName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de nacimiento</Label>
              <DateInput
                id="birthDate"
                value={profile.birthDate}
                disabled={!isEditable}
                max={new Date().toISOString().slice(0, 10)}
                onValueChange={(value) => {
                  setProfile((v) => ({ ...v, birthDate: value }));
                  clearError("birthDate");
                }}
              />
              {profileErrors.birthDate && (
                <p className="text-xs text-destructive">{profileErrors.birthDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={profile.phone}
                disabled={!isEditable}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 8);
                  setProfile((v) => ({ ...v, phone: value }));
                  clearError("phone");
                }}
              />
              {profileErrors.phone && (
                <p className="text-xs text-destructive">{profileErrors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ci">Cédula de identidad</Label>
              <Input
                id="ci"
                value={profile.ci}
                disabled={!isEditable}
                onChange={(e) => {
                  setProfile((v) => ({ ...v, ci: e.target.value.slice(0, 20) }));
                  clearError("ci");
                }}
              />
              {profileErrors.ci && (
                <p className="text-xs text-destructive">{profileErrors.ci}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profession">Profesión / Cargo</Label>
              <Input
                id="profession"
                value={profile.profession}
                disabled={!isEditable}
                onChange={(e) => {
                  setProfile((v) => ({ ...v, profession: e.target.value.slice(0, 80) }));
                  clearError("profession");
                }}
              />
              {profileErrors.profession && (
                <p className="text-xs text-destructive">{profileErrors.profession}</p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="lastLogin">Último acceso</Label>
              <Input
                value={profile.lastLogin ? new Date(profile.lastLogin).toLocaleString("es-BO") : "Sin registro"}
                disabled
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Resumen Profesional */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-6">Resumen Profesional</h2>
        <div className="rounded-2xl border bg-card p-8 space-y-8">
          <div className="space-y-2">
            <Label htmlFor="aboutMe">Acerca de mí</Label>
            <Textarea
              id="aboutMe"
              value={profile.aboutMe}
              disabled={!isEditable}
              placeholder="Describe tu experiencia y rol como Super Admin..."
              rows={5}
              onChange={(e) => {
                setProfile((v) => ({ ...v, aboutMe: e.target.value.slice(0, 600) }));
                clearError("aboutMe");
              }}
            />
            {profileErrors.aboutMe && (
              <p className="text-xs text-destructive">{profileErrors.aboutMe}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="skills">Habilidades clave</Label>
              <Input
                id="skills"
                value={profile.skills}
                disabled={!isEditable}
                placeholder="Liderazgo:85, Inventario:78, Ventas:90"
                onChange={(e) => {
                  setProfile((v) => ({ ...v, skills: e.target.value.slice(0, 300) }));
                  clearError("skills");
                }}
              />
              {profileErrors.skills && (
                <p className="text-xs text-destructive">{profileErrors.skills}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">Idiomas</Label>
              <Input
                id="languages"
                value={profile.languages}
                disabled={!isEditable}
                placeholder="Español:C2:Nativo, Inglés:B2"
                onChange={(e) => {
                  setProfile((v) => ({ ...v, languages: e.target.value.slice(0, 500) }));
                  clearError("languages");
                }}
              />
              {profileErrors.languages && (
                <p className="text-xs text-destructive">{profileErrors.languages}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Credenciales de Acceso */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-6">Credenciales de Acceso</h2>
        <div className="rounded-2xl border bg-card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Cambios en credenciales requieren confirmación con tu contraseña actual.
              </p>
            </div>
            {profile.canChangeCredentials && isEditable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingCredentials(!isEditingCredentials)}
              >
                {isEditingCredentials ? "Cancelar" : "Cambiar credenciales"}
              </Button>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Usuario actual</Label>
            <Input value={profile.initialUsername} disabled readOnly />
          </div>

          {isEditingCredentials && profile.canChangeCredentials && isEditable && (
            <div className="grid grid-cols-1 gap-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nuevo nombre de usuario</Label>
                <Input
                  id="username"
                  value={profile.username}
                  onChange={(e) => {
                    setProfile((v) => ({ ...v, username: e.target.value.toLowerCase() }));
                    clearError("username");
                  }}
                />
                {profileErrors.username && (
                  <p className="text-xs text-destructive">{profileErrors.username}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <PasswordInput
                    id="newPassword"
                    value={profile.newPassword}
                    onChange={(e) => {
                      setProfile((v) => ({ ...v, newPassword: e.target.value }));
                      clearError("newPassword");
                    }}
                  />
                  {profileErrors.newPassword && (
                    <p className="text-xs text-destructive">{profileErrors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPasswordConfirm">Confirmar nueva contraseña</Label>
                  <PasswordInput
                    id="newPasswordConfirm"
                    value={profile.newPasswordConfirm}
                    onChange={(e) => {
                      setProfile((v) => ({ ...v, newPasswordConfirm: e.target.value }));
                      clearError("newPasswordConfirm");
                    }}
                  />
                  {profileErrors.newPasswordConfirm && (
                    <p className="text-xs text-destructive">{profileErrors.newPasswordConfirm}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}