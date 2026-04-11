"use client";

import { type ReactNode, useState, useTransition } from "react";

import { toast } from "sonner";

import { useRouter } from "next/navigation";

import {
  sanitizeCiInput,
  sanitizeHumanNameInput,
  sanitizePhoneInput,
  sanitizeProfessionInput,
  truncateInput,
  updateSuperAdminMePersonalAction,
  validatePersonalInput,
  type EditableProfile,
} from "@/actions/super-admin/me";

import { ProfileAvatarUploader } from "@/components/super-admin/dashboard/me/content/profile-avatar-uploader";
import {
  EditStepsHeader,
  ReviewChangesPanel,
  type ReviewChangeItem,
} from "@/components/super-admin/dashboard/me/shared/edit-review";
import { FieldError } from "@/components/super-admin/dashboard/me/shared/field-error";
import { PasswordConfirmModal } from "@/components/super-admin/dashboard/me/shared/password-confirm-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  profile: EditableProfile;
};

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

function formatNextProfileEditDate(value: string | null): string {
  if (!value) return "fecha pendiente";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "fecha pendiente";
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
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
    if (field.previous !== field.next) {
      changes.push(field);
    }
  });

  return changes;
}

export function PersonalForm({ profile }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2>(1);
  const [reviewChanges, setReviewChanges] = useState<ReviewChangeItem[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<PersonalErrors>({});

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
    if (!errors[field]) return;
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const requestSave = () => {
    if (!profile.canEditPersonal) {
      setSubmitMessage(`Podras editar datos personales nuevamente desde ${formatNextProfileEditDate(profile.nextPersonalEditAt)}.`);
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
        const message = result.error ?? "No se pudo actualizar";
        setConfirmError(message);
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
      <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
        <EditStepsHeader
          currentStep={step}
          firstTitle="Editar datos personales"
          firstDescription="Actualiza nombre, contacto y descripcion general del perfil."
          secondTitle="Revisar cambios"
          secondDescription="Valida el resumen y confirma desde el modal con tu contrasena actual."
        />

        {!profile.canEditPersonal ? (
          <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
            <Badge variant="outline">Anuncio</Badge>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Esta seccion se puede editar cada 3 meses. Proxima edicion disponible: {formatNextProfileEditDate(profile.nextPersonalEditAt)}.
            </p>
          </div>
        ) : null}

        {step === 1 ? (
          <>
            <div className="flex flex-col gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 sm:flex-row sm:items-center">
              <ProfileAvatarUploader initials={initials} photoUrl={profile.photoUrl || null} className="size-20" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Foto de perfil</p>
                <p className="text-sm text-muted-foreground">La imagen actual se refleja tambien en el sidebar del dashboard.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Nombre">
                <Input
                  value={form.firstName}
                  placeholder="Ej. Ana"
                  disabled={!profile.canEditPersonal}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, firstName: sanitizeHumanNameInput(event.target.value) }));
                    clearFieldError("firstName");
                  }}
                />
                <FieldError message={errors.firstName} />
              </Field>

              <Field label="Apellido">
                <Input
                  value={form.lastName}
                  placeholder="Ej. Perez"
                  disabled={!profile.canEditPersonal}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, lastName: sanitizeHumanNameInput(event.target.value) }));
                    clearFieldError("lastName");
                  }}
                />
                <FieldError message={errors.lastName} />
              </Field>

              <Field label="Fecha de nacimiento">
                <DateInput
                  value={form.birthDate}
                  max={new Date().toISOString().slice(0, 10)}
                  placeholder="Selecciona una fecha"
                  disabled={!profile.canEditPersonal}
                  onValueChange={(value) => {
                    setForm((prev) => ({ ...prev, birthDate: value }));
                    clearFieldError("birthDate");
                  }}
                />
                <FieldError message={errors.birthDate} />
              </Field>

              <Field label="Telefono (Bolivia)">
                <div className={`flex overflow-hidden rounded-lg border ${errors.phone ? "border-destructive" : "border-input"}`}>
                  <span className="inline-flex items-center border-r border-border px-3 text-sm text-muted-foreground">+591</span>
                  <Input
                    value={form.phone}
                    inputMode="numeric"
                    maxLength={8}
                    pattern="[67][0-9]{7}"
                    placeholder="71234567"
                    className="border-0"
                    disabled={!profile.canEditPersonal}
                    onChange={(event) => {
                      setForm((prev) => ({ ...prev, phone: sanitizePhoneInput(event.target.value) }));
                      clearFieldError("phone");
                    }}
                  />
                </div>
                <FieldError message={errors.phone} />
              </Field>

              <Field label="Cedula de identidad">
                <Input
                  value={form.ci}
                  placeholder="1234567-LP"
                  disabled={!profile.canEditPersonal}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, ci: sanitizeCiInput(event.target.value) }));
                    clearFieldError("ci");
                  }}
                />
                <FieldError message={errors.ci} />
              </Field>

              <Field label="Profesion o cargo">
                <Input
                  value={form.profession}
                  placeholder="Ej. Gerente de operaciones"
                  disabled={!profile.canEditPersonal}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, profession: sanitizeProfessionInput(event.target.value) }));
                    clearFieldError("profession");
                  }}
                />
                <FieldError message={errors.profession} />
              </Field>
            </div>

            <Field label="Acerca de mi">
              <Textarea
                rows={5}
                value={form.aboutMe}
                placeholder="Describe tu experiencia y responsabilidades principales"
                disabled={!profile.canEditPersonal}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, aboutMe: truncateInput(event.target.value, 600) }));
                  clearFieldError("aboutMe");
                }}
              />
              <FieldError message={errors.aboutMe} />
            </Field>
          </>
        ) : (
          <ReviewChangesPanel
            title="Resumen de cambios personales"
            description="Revisa cuidadosamente los datos antes de confirmar. Al finalizar, esta seccion quedara bloqueada por 3 meses."
            changes={reviewChanges}
          />
        )}

        {submitMessage ? <p className="text-sm text-muted-foreground">{submitMessage}</p> : null}

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
          {step === 2 ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setConfirmError(null);
                }}
              >
                Volver a editar
              </Button>
              <Button
                type="button"
                disabled={isPending}
                className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                onClick={() => {
                  setConfirmError(null);
                  setConfirmOpen(true);
                }}
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
        title="Confirmar cambios"
        description="Ingresa tu contrasena actual para guardar los cambios."
        policyNotice="Al confirmar, esta seccion quedara bloqueada durante 3 meses."
        isPending={isPending}
        errorMessage={confirmError}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmSave}
      />
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
