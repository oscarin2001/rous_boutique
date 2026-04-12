"use client";

import { useRef, useState, useTransition } from "react";

import { toast } from "sonner";

import { useRouter } from "next/navigation";

import {
  sanitizeCiInput,
  sanitizeHumanNameInput,
  sanitizePhoneInput,
  sanitizeProfessionInput,
  truncateInput,
  uploadSuperAdminMePhotoAction,
  updateSuperAdminMePersonalAction,
  validatePersonalInput,
  type EditableProfile,
} from "@/actions/super-admin/me";

import { InlineFieldError } from "@/components/super-admin/dashboard/shared/forms/inline-feedback";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { ProfileAvatarUploader } from "../../content/profile-avatar-uploader";
import {
  ReviewChangesPanel,
  type ReviewChangeItem,
} from "../../shared/edit-review";
import { FieldError } from "../../shared/field-error";
import { PasswordConfirmModal } from "../../shared/password-confirm-modal";


type Props = { profile: EditableProfile };
type PersonalErrors = ReturnType<typeof validatePersonalInput>;

type PersonalDraft = {
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  ci: string;
  profession: string;
  aboutMe: string;
};

function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}

function formatDateValue(value: string) {
  if (!value) return "Sin registrar";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Sin registrar";
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTextValue(value: string, fallback = "Sin registrar") {
  const normalized = value.trim();
  return normalized || fallback;
}

function formatPhoneValue(value: string) {
  return value ? `+591 ${value}` : "Sin telefono";
}

function summarizeText(value: string, fallback = "Sin descripcion") {
  const normalized = value.trim();
  if (!normalized) return fallback;
  return normalized.length > 180 ? `${normalized.slice(0, 177)}...` : normalized;
}

function buildReviewChanges(profile: EditableProfile, form: PersonalDraft): ReviewChangeItem[] {
  const changes: ReviewChangeItem[] = [];

  const fields: Array<{
    label: string;
    previous: string;
    next: string;
  }> = [
    {
      label: "Nombre",
      previous: formatTextValue(profile.firstName),
      next: formatTextValue(form.firstName),
    },
    {
      label: "Apellido",
      previous: formatTextValue(profile.lastName),
      next: formatTextValue(form.lastName),
    },
    {
      label: "Fecha de nacimiento",
      previous: formatDateValue(profile.birthDate),
      next: formatDateValue(form.birthDate),
    },
    {
      label: "Telefono",
      previous: formatPhoneValue(profile.phone),
      next: formatPhoneValue(form.phone),
    },
    {
      label: "Cedula de identidad",
      previous: formatTextValue(profile.ci),
      next: formatTextValue(form.ci),
    },
    {
      label: "Profesion o cargo",
      previous: formatTextValue(profile.profession),
      next: formatTextValue(form.profession),
    },
    {
      label: "Resumen profesional",
      previous: summarizeText(profile.aboutMe, "Sin descripcion"),
      next: summarizeText(form.aboutMe, "Sin descripcion"),
    },
  ];

  fields.forEach((field) => {
    if (field.previous !== field.next) changes.push(field);
  });

  return changes;
}

export function PersonalForm({ profile }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploadingPhoto, startUploadTransition] = useTransition();
  const [step, setStep] = useState<1 | 2>(1);
  const [reviewChanges, setReviewChanges] = useState<ReviewChangeItem[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [errors, setErrors] = useState<PersonalErrors>({});
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<PersonalDraft>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    birthDate: profile.birthDate,
    phone: profile.phone,
    ci: profile.ci,
    profession: profile.profession,
    aboutMe: profile.aboutMe,
  });

  const hasChanges =
    form.firstName !== profile.firstName ||
    form.lastName !== profile.lastName ||
    form.birthDate !== profile.birthDate ||
    form.phone !== profile.phone ||
    form.ci !== profile.ci ||
    form.profession !== profile.profession ||
    form.aboutMe !== profile.aboutMe;

  const initials = `${form.firstName[0] ?? ""}${form.lastName[0] ?? ""}`.toUpperCase();

  const clearFieldError = (field: keyof PersonalErrors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePhotoChange = (file: File) => {
    if (!profile.canEditPersonal) return;

    setPhotoError(null);
    startUploadTransition(async () => {
      const result = await uploadSuperAdminMePhotoAction(file);
      if (!result.success || !result.data) {
        const error = result.error ?? "No se pudo actualizar la foto de perfil";
        setPhotoError(error);
        toast.error(error);
        return;
      }

      setPhotoUrl(result.data.photoUrl);
      toast.success("Foto de perfil actualizada");
      router.refresh();
    });
  };

  const requestSave = () => {
    if (!profile.canEditPersonal) {
      setSubmitMessage(`Podras editar nuevamente a partir del: ${formatNextProfileEditDate(profile.nextPersonalEditAt)}`);
      return;
    }

    if (!hasChanges) {
      setSubmitMessage("No hay cambios para guardar.");
      return;
    }

    const validationErrors = validatePersonalInput({
      ...form,
      currentPassword: "tmpPass123A",
    });
    validationErrors.currentPassword = undefined;
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      setSubmitMessage(null);
      return;
    }

    const changes = buildReviewChanges(profile, form);
    if (!changes.length) {
      setSubmitMessage("No detectamos cambios para revisar.");
      return;
    }

    setReviewChanges(changes);
    setSubmitMessage(null);
    setConfirmError(null);
    setStep(2);
  };

  const handleConfirmSave = (currentPassword: string) => {
    const input = {
      ...form,
      currentPassword,
    };

    const validationErrors = validatePersonalInput(input);
    const modalError = validationErrors.currentPassword;
    validationErrors.currentPassword = undefined;
    setErrors(validationErrors);

    if (hasErrors(validationErrors) || modalError) {
      setConfirmError(modalError ?? null);
      setSubmitMessage(null);
      return;
    }

    setConfirmError(null);
    startTransition(async () => {
      const result = await updateSuperAdminMePersonalAction(input);

      if (!result.success) {
        setConfirmError(result.error ?? "No se pudo actualizar");
        return;
      }

      toast.success("Datos personales actualizados");
      setSubmitMessage(null);
      setConfirmOpen(false);
      setConfirmError(null);
      setReviewChanges([]);
      setStep(1);
      router.refresh();
    });
  };

  return (
    <>
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        {step === 1 ? (
          <div className="space-y-8">
            {/* Avatar Section */}
            <div className="flex items-center gap-6 rounded-2xl bg-muted/35 p-6">
              <ProfileAvatarUploader initials={initials} photoUrl={photoUrl || null} className="size-24" />
              <div className="space-y-2">
                <p className="font-medium">Foto de perfil</p>
                <p className="text-sm text-muted-foreground">Solo puedes cambiar la foto desde esta sección de edición.</p>
                <input
                  ref={photoInputRef}
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={!profile.canEditPersonal || isUploadingPhoto}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.currentTarget.value = "";
                    if (!file) return;
                    handlePhotoChange(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!profile.canEditPersonal || isUploadingPhoto}
                  onClick={() => photoInputRef.current?.click()}
                >
                  {isUploadingPhoto ? "Subiendo..." : "Cambiar foto"}
                </Button>
                <InlineFieldError message={photoError} />
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-9 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={form.firstName}
                  placeholder="Ej. Juan"
                  minLength={2}
                  maxLength={30}
                  disabled={!profile.canEditPersonal}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, firstName: sanitizeHumanNameInput(e.target.value) }));
                    clearFieldError("firstName");
                  }}
                />
                <FieldError message={errors.firstName} />
              </div>

              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input
                  value={form.lastName}
                  placeholder="Ej. Pérez"
                  minLength={2}
                  maxLength={30}
                  disabled={!profile.canEditPersonal}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, lastName: sanitizeHumanNameInput(e.target.value) }));
                    clearFieldError("lastName");
                  }}
                />
                <FieldError message={errors.lastName} />
              </div>

              <div className="space-y-2">
                <Label>Fecha de nacimiento</Label>
                <DateInput
                  value={form.birthDate}
                  max={new Date().toISOString().slice(0, 10)}
                  disabled={!profile.canEditPersonal}
                  onValueChange={(value) => {
                    setForm((p) => ({ ...p, birthDate: value }));
                    clearFieldError("birthDate");
                  }}
                />
                <FieldError message={errors.birthDate} />
              </div>

              <div className="space-y-2">
                <Label>Teléfono (+591)</Label>
                <div className="flex rounded-lg bg-muted/35 focus-within:ring-1 focus-within:ring-primary/25">
                  <span className="flex items-center px-4 text-muted-foreground">+591</span>
                  <Input
                    value={form.phone}
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="71234567"
                    className="border-0 bg-transparent"
                    disabled={!profile.canEditPersonal}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, phone: sanitizePhoneInput(e.target.value) }));
                      clearFieldError("phone");
                    }}
                  />
                </div>
                <FieldError message={errors.phone} />
              </div>

              <div className="space-y-2">
                <Label>Cédula de identidad</Label>
                <Input
                  value={form.ci}
                  placeholder="1234567 LP"
                  minLength={5}
                  maxLength={20}
                  disabled={!profile.canEditPersonal}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, ci: sanitizeCiInput(e.target.value) }));
                    clearFieldError("ci");
                  }}
                />
                <FieldError message={errors.ci} />
              </div>

              <div className="space-y-2">
                <Label>Profesión / Cargo</Label>
                <Input
                  value={form.profession}
                  placeholder="Ej. Ingeniero de Software"
                  maxLength={80}
                  disabled={!profile.canEditPersonal}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, profession: sanitizeProfessionInput(e.target.value) }));
                    clearFieldError("profession");
                  }}
                />
                <FieldError message={errors.profession} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Acerca de mí</Label>
              <Textarea
                rows={6}
                value={form.aboutMe}
                placeholder="Breve resumen profesional..."
                maxLength={600}
                disabled={!profile.canEditPersonal}
                onChange={(e) => {
                  setForm((p) => ({ ...p, aboutMe: truncateInput(e.target.value, 600) }));
                  clearFieldError("aboutMe");
                }}
              />
              <FieldError message={errors.aboutMe} />
            </div>
          </div>
        ) : (
          <ReviewChangesPanel
            title="Resumen de cambios"
            description="Revisa cuidadosamente antes de confirmar."
            changes={reviewChanges}
          />
        )}

        {submitMessage && <p className="text-sm text-amber-600">{submitMessage}</p>}

        <div className="mt-8 flex justify-end gap-3">
          {step === 2 ? (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Volver a editar
              </Button>
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Confirmar cambios
              </Button>
            </>
          ) : (
            <Button onClick={requestSave} disabled={isPending || !profile.canEditPersonal}>
              Revisar cambios
            </Button>
          )}
        </div>
      </div>

      <PasswordConfirmModal
        open={confirmOpen}
        title="Confirmar actualización"
        description="¿Estas seguro de confirmar estos cambios? Ingresa tu contraseña actual para continuar."
        sectionTitle="Editar datos personales"
        sectionSummary="Actualiza tu información básica y descripción profesional."
        policyNotice={`Al confirmar, el proximo cambio de esta seccion se habilitara en 3 meses. Proxima edicion disponible: ${formatNextProfileEditDate(profile.nextPersonalEditAt)}.`}
        confirmLabel="Si, confirmar cambios"
        isPending={isPending}
        errorMessage={confirmError}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmSave}
      />
    </>
  );
}

// Función auxiliar (puedes moverla a un archivo compartido)
function formatNextProfileEditDate(value: string | null): string {
  if (!value) return "pendiente";
  const date = new Date(value);
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}