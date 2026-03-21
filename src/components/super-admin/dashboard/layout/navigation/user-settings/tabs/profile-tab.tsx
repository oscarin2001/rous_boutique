"use client";

import { type ChangeEvent, useRef, useState } from "react";

import { ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";

import { uploadSuperAdminProfilePhotoAction } from "@/actions/super-admin/user-settings/actions";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";

import { InfoHint } from "../components";
import type { ProfileFieldErrors, ProfileForm } from "../core";

function buildAboutMeText(profile: ProfileForm) {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || "Este profesional";
  const profession = profile.profession.trim() || "profesional orientado a resultados";

  const skillNames = profile.skills
    .split(",")
    .map((chunk) => chunk.trim().split(":")[0]?.trim())
    .filter(Boolean)
    .slice(0, 3) as string[];
  const skillsText = skillNames.length ? skillNames.join(", ") : "liderazgo, coordinacion y mejora continua";

  const languageNames = profile.languages
    .split(",")
    .map((chunk) => {
      const [namePart, levelPart] = chunk.trim().split(":");
      const name = namePart?.trim();
      const level = levelPart?.trim();
      if (!name) return null;
      return level ? `${name} ${level}` : name;
    })
    .filter(Boolean)
    .slice(0, 3) as string[];
  const languagesText = languageNames.length ? languageNames.join(", ") : "espanol";

  return `${fullName} se desempena como ${profession}. Se enfoca en la gestion eficiente, el cumplimiento de objetivos y la mejora de procesos. Aporta fortalezas en ${skillsText} y se comunica en ${languagesText}.`;
}

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
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(true);
  const [isProfessionalSummaryOpen, setIsProfessionalSummaryOpen] = useState(false);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);

  const clear = (key: keyof ProfileFieldErrors) => setProfileErrors((v) => ({ ...v, [key]: undefined }));

  const cancelCredentialEdition = () => {
    setProfile((v) => ({ ...v, username: v.initialUsername, newPassword: "", newPasswordConfirm: "" }));
    setIsEditingCredentials(false);
  };

  const handlePhotoFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const result = await uploadSuperAdminProfilePhotoAction(file);
    setIsUploadingPhoto(false);

    if (!result.success || !result.data) {
      toast.error(result.error ?? "No se pudo subir la foto");
      event.target.value = "";
      return;
    }

    setProfile((prev) => ({ ...prev, photoUrl: result.data.photoUrl }));
    clear("photoUrl");
    toast.success("Foto subida correctamente");
    event.target.value = "";
  };

  const handleGenerateAboutMe = () => {
    const generated = buildAboutMeText(profile).slice(0, 600);
    setProfile((prev) => ({ ...prev, aboutMe: generated }));
    clear("aboutMe");
    toast.success("Texto de perfil generado");
  };

  const triggerIconClass = (open: boolean) => `size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`;

  const hasIdentityChanges =
    profile.firstName !== profileSnapshot.firstName ||
    profile.lastName !== profileSnapshot.lastName ||
    profile.birthDate !== profileSnapshot.birthDate ||
    profile.phone !== profileSnapshot.phone ||
    profile.ci !== profileSnapshot.ci ||
    profile.profession !== profileSnapshot.profession ||
    profile.photoUrl !== profileSnapshot.photoUrl;

  const hasSummaryChanges =
    profile.aboutMe !== profileSnapshot.aboutMe ||
    profile.skills !== profileSnapshot.skills ||
    profile.languages !== profileSnapshot.languages;

  const hasCredentialChanges =
    profile.username !== profileSnapshot.username ||
    Boolean(profile.newPassword) ||
    Boolean(profile.newPasswordConfirm);

  return (
    <div className="space-y-4">
      <Collapsible open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen} className="rounded-xl bg-card/80 shadow-sm ring-1 ring-border/40">
        <CollapsibleTrigger render={<div />} nativeButton={false} className="flex w-full items-start justify-between gap-3 p-4 text-left">
          <div>
            <h3 className="text-sm font-semibold">{isEditable ? "Editar perfil" : "Ver mi perfil"}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Gestiona identidad del superadmin y credenciales de acceso con confirmacion segura.</p>
          </div>
          <ChevronDownIcon className={triggerIconClass(isEditProfileOpen)} />
        </CollapsibleTrigger>

        <CollapsibleContent className="grid gap-3 border-t px-4 py-4 sm:grid-cols-2">
          <p className="sm:col-span-2 flex items-center gap-1 text-xs text-muted-foreground">
            Estos datos actualizan nombre, apellido, CI, telefono y fecha de nacimiento usados en perfil y auditoria.
            <InfoHint text="Estos datos actualizan nombre, apellido, CI, telefono y fecha de nacimiento usados en perfil y auditoria." />
          </p>
          <div><Label htmlFor="firstName">Nombre</Label><Input id="firstName" disabled={!isEditable} value={profile.firstName} onChange={(e) => { setProfile((v) => ({ ...v, firstName: e.target.value })); clear("firstName"); }} />{profileErrors.firstName ? <p className="mt-1 text-xs text-destructive">{profileErrors.firstName}</p> : null}</div>
          <div><Label htmlFor="lastName">Apellido</Label><Input id="lastName" disabled={!isEditable} value={profile.lastName} onChange={(e) => { setProfile((v) => ({ ...v, lastName: e.target.value })); clear("lastName"); }} />{profileErrors.lastName ? <p className="mt-1 text-xs text-destructive">{profileErrors.lastName}</p> : null}</div>
          <div><Label htmlFor="birthDate">Fecha de nacimiento</Label><DateInput id="birthDate" disabled={!isEditable} max={new Date().toISOString().slice(0, 10)} value={profile.birthDate} onValueChange={(value) => { setProfile((v) => ({ ...v, birthDate: value })); clear("birthDate"); }} />{profileErrors.birthDate ? <p className="mt-1 text-xs text-destructive">{profileErrors.birthDate}</p> : null}</div>
          <div><Label htmlFor="phone">Telefono</Label><Input id="phone" disabled={!isEditable} value={profile.phone} onChange={(e) => { setProfile((v) => ({ ...v, phone: e.target.value.replace(/\D/g, "").slice(0, 8) })); clear("phone"); }} />{profileErrors.phone ? <p className="mt-1 text-xs text-destructive">{profileErrors.phone}</p> : null}</div>
          <div><Label htmlFor="ci">CI</Label><Input id="ci" disabled={!isEditable} value={profile.ci} onChange={(e) => { setProfile((v) => ({ ...v, ci: e.target.value.slice(0, 20) })); clear("ci"); }} />{profileErrors.ci ? <p className="mt-1 text-xs text-destructive">{profileErrors.ci}</p> : null}</div>
          <div><Label htmlFor="profession">Profesion</Label><Input id="profession" disabled={!isEditable} value={profile.profession} onChange={(e) => { setProfile((v) => ({ ...v, profession: e.target.value.slice(0, 80) })); clear("profession"); }} />{profileErrors.profession ? <p className="mt-1 text-xs text-destructive">{profileErrors.profession}</p> : null}</div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="photoUrl">Foto</Label>
            <Input id="photoUrl" disabled={!isEditable} value={profile.photoUrl} placeholder="https://... o /uploads/employees/foto.jpg" onChange={(e) => { setProfile((v) => ({ ...v, photoUrl: e.target.value.slice(0, 300) })); clear("photoUrl"); }} />
            <div className="flex flex-wrap items-center gap-2">
              <input ref={photoInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handlePhotoFile} />
              <Button type="button" variant="outline" size="sm" disabled={!isEditable || isUploadingPhoto} onClick={() => photoInputRef.current?.click()}>
                {isUploadingPhoto ? "Subiendo foto..." : "Subir archivo"}
              </Button>
              <p className="text-xs text-muted-foreground">JPG, PNG o WEBP. Max 5MB.</p>
            </div>
            {profileErrors.photoUrl ? <p className="mt-1 text-xs text-destructive">{profileErrors.photoUrl}</p> : null}
          </div>
          <div>
            <Label htmlFor="lastLogin">Ultimo acceso</Label>
            <Input id="lastLogin" value={profile.lastLogin ? new Date(profile.lastLogin).toLocaleString("es-BO") : "Sin registro"} disabled readOnly />
          </div>
          {isEditable ? (
            <div className="sm:col-span-2 flex justify-end">
              <Button type="button" disabled={isPending || !hasIdentityChanges} onClick={onSave}>Guardar seccion</Button>
            </div>
          ) : null}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={isProfessionalSummaryOpen} onOpenChange={setIsProfessionalSummaryOpen} className="rounded-xl bg-card/80 shadow-sm ring-1 ring-border/40">
        <CollapsibleTrigger render={<div />} nativeButton={false} className="flex w-full items-center justify-between gap-3 p-4 text-left">
          <p className="text-sm font-semibold">Resumen profesional</p>
          <ChevronDownIcon className={triggerIconClass(isProfessionalSummaryOpen)} />
        </CollapsibleTrigger>
        <CollapsibleContent className="grid gap-3 border-t p-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><div className="flex items-center justify-between gap-2"><Label htmlFor="aboutMe">Acerca de mi</Label><Button type="button" variant="outline" size="sm" disabled={!isEditable} onClick={handleGenerateAboutMe}>Generar texto profesional</Button></div><Textarea id="aboutMe" disabled={!isEditable} value={profile.aboutMe} placeholder="Ejemplo: Soy un profesional orientado a resultados, enfocado en liderazgo de equipos, optimizacion de procesos y crecimiento sostenible del negocio..." onChange={(e) => { setProfile((v) => ({ ...v, aboutMe: e.target.value.slice(0, 600) })); clear("aboutMe"); }} rows={4} /><p className="mt-1 text-xs text-muted-foreground">Redacta un texto profesional sobre tu perfil, experiencia, enfoque y fortalezas.</p>{profileErrors.aboutMe ? <p className="mt-1 text-xs text-destructive">{profileErrors.aboutMe}</p> : null}</div>
          <div className="sm:col-span-2"><Label htmlFor="skills">Habilidades (max 10, ej: Liderazgo:85, Inventario:78, Ventas:90)</Label><Input id="skills" disabled={!isEditable} value={profile.skills} onChange={(e) => { setProfile((v) => ({ ...v, skills: e.target.value.slice(0, 300) })); clear("skills"); }} />{profileErrors.skills ? <p className="mt-1 text-xs text-destructive">{profileErrors.skills}</p> : null}</div>
          <div className="sm:col-span-2"><Label htmlFor="languages">Idiomas (ej: Espanol:C2:Nativo, Ingles:B2:IELTS)</Label><Input id="languages" disabled={!isEditable} value={profile.languages} onChange={(e) => { setProfile((v) => ({ ...v, languages: e.target.value.slice(0, 500) })); clear("languages"); }} />{profileErrors.languages ? <p className="mt-1 text-xs text-destructive">{profileErrors.languages}</p> : null}</div>
          {isEditable ? (
            <div className="sm:col-span-2 flex justify-end">
              <Button type="button" disabled={isPending || !hasSummaryChanges} onClick={onSave}>Guardar seccion</Button>
            </div>
          ) : null}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={isCredentialsOpen} onOpenChange={setIsCredentialsOpen} className="rounded-xl bg-card/80 shadow-sm ring-1 ring-border/40">
        <CollapsibleTrigger render={<div />} nativeButton={false} className="flex w-full items-center justify-between gap-3 p-4 text-left">
          <p className="text-sm font-semibold">Credenciales del superadmin</p>
          <ChevronDownIcon className={triggerIconClass(isCredentialsOpen)} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 border-t p-4">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            El usuario actual se muestra, pero nunca la contrasena. Solo puedes cambiar credenciales cada 3 meses.
            <InfoHint text="El usuario actual se muestra, pero nunca la contrasena. Solo puedes cambiar credenciales cada 3 meses." />
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">Al guardar cambios de credenciales se solicitara contrasena actual para confirmar.</p>
            {profile.canChangeCredentials && isEditable ? <Button type="button" variant="outline" size="sm" onClick={() => (isEditingCredentials ? cancelCredentialEdition() : setIsEditingCredentials(true))}>{isEditingCredentials ? "Cancelar credenciales" : "Editar credenciales"}</Button> : null}
          </div>
          <div><Label htmlFor="currentUsername">Usuario actual</Label><Input id="currentUsername" value={profile.initialUsername} disabled readOnly /><p className="mt-1 text-xs text-muted-foreground">La contrasena actual nunca se muestra por seguridad.</p></div>
          {isEditingCredentials && profile.canChangeCredentials && isEditable ? (
            <div className="space-y-3">
              <div><Label htmlFor="username">Nuevo usuario</Label><Input id="username" disabled={!isEditable} value={profile.username} onChange={(e) => { setProfile((v) => ({ ...v, username: e.target.value.toLowerCase() })); clear("username"); }} />{profileErrors.username ? <p className="mt-1 text-xs text-destructive">{profileErrors.username}</p> : null}</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div><Label htmlFor="newPassword">Nueva contrasena</Label><PasswordInput id="newPassword" disabled={!isEditable} value={profile.newPassword} onChange={(e) => { setProfile((v) => ({ ...v, newPassword: e.target.value })); clear("newPassword"); }} />{profileErrors.newPassword ? <p className="mt-1 text-xs text-destructive">{profileErrors.newPassword}</p> : null}</div>
                <div><Label htmlFor="newPasswordConfirm">Confirmar nueva contrasena</Label><PasswordInput id="newPasswordConfirm" disabled={!isEditable} value={profile.newPasswordConfirm} onChange={(e) => { setProfile((v) => ({ ...v, newPasswordConfirm: e.target.value })); clear("newPasswordConfirm"); }} />{profileErrors.newPasswordConfirm ? <p className="mt-1 text-xs text-destructive">{profileErrors.newPasswordConfirm}</p> : null}</div>
              </div>
            </div>
          ) : null}
          {isEditable ? (
            <div className="flex justify-end">
              <Button type="button" disabled={isPending || !hasCredentialChanges} onClick={onSave}>Guardar seccion</Button>
            </div>
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
