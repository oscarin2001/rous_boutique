"use client";

import { useMemo, useState, useTransition } from "react";

import { Plus, Trash2, Award, Globe } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "next/navigation";

import {
  updateSuperAdminMeCompetenciesAction,
  validateCompetenciesInput,
  type EditableProfile,
} from "@/actions/super-admin/me";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ReviewChangesPanel, type ReviewChangeItem } from "../../shared/edit-review";
import { FieldError } from "../../shared/field-error";
import { PasswordConfirmModal } from "../../shared/password-confirm-modal";

type Props = { profile: EditableProfile };

const MAX_SKILLS = 10;
const MAX_LANGUAGES = 10;
const MAX_ENTRY_NAME_LENGTH = 40;
const MAX_CERTIFICATION_LENGTH = 60;
const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

type SkillRow = { id: string; name: string; level: string };
type LanguageRow = { id: string; name: string; level: typeof LANGUAGE_LEVELS[number]; certification: string };
type CompetenciesErrors = ReturnType<typeof validateCompetenciesInput>;

function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}

function buildRowId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeSkillLevel(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 3);
  if (!digits) return "";
  const numeric = Number(digits);
  if (!Number.isFinite(numeric)) return "";
  return String(Math.max(0, Math.min(100, numeric)));
}

function sanitizeHumanEntry(value: string, maxLength: number) {
  return value
    .replace(/[\n\r]/g, " ")
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ .'-]/g, "")
    .replace(/\s{2,}/g, " ")
    .trimStart()
    .slice(0, maxLength);
}

function sanitizeCertificationEntry(value: string) {
  return sanitizeHumanEntry(value, MAX_CERTIFICATION_LENGTH);
}

function parseSkillRows(raw: string): SkillRow[] {
  if (!raw.trim()) return [];

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((entry) => {
      const [namePart = "", levelPart = "70"] = entry.split(":");
      const level = normalizeSkillLevel(levelPart.trim()) || "70";
      return {
        id: buildRowId("skill"),
        name: namePart.trim(),
        level,
      };
    })
    .filter((row) => row.name);
}

function parseLanguageRows(raw: string): LanguageRow[] {
  if (!raw.trim()) return [];

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((entry) => {
      const [namePart = "", levelPart = "A1", ...certParts] = entry.split(":");
      const level = LANGUAGE_LEVELS.includes(levelPart.trim() as (typeof LANGUAGE_LEVELS)[number])
        ? (levelPart.trim() as (typeof LANGUAGE_LEVELS)[number])
        : "A1";
      return {
        id: buildRowId("lang"),
        name: namePart.trim(),
        level,
        certification: certParts.join(":").trim() || "Sin certificacion",
      };
    })
    .filter((row) => row.name);
}

function buildSkillsPayload(rows: SkillRow[]): string {
  return rows
    .map((row) => {
      const name = row.name.trim();
      const numeric = Number(row.level);
      if (!name || !Number.isFinite(numeric)) return "";
      const level = Math.max(0, Math.min(100, Math.round(numeric)));
      return `${name}:${level}`;
    })
    .filter(Boolean)
    .join(", ");
}

function buildLanguagesPayload(rows: LanguageRow[]): string {
  return rows
    .map((row) => {
      const name = row.name.trim();
      const certification = row.certification.trim();
      if (!name || !certification) return "";
      return `${name}:${row.level}:${certification}`;
    })
    .filter(Boolean)
    .join(", ");
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

function buildReviewChanges(
  profile: EditableProfile,
  skillRows: SkillRow[],
  languageRows: LanguageRow[],
): ReviewChangeItem[] {
  const currentSkills = buildSkillsPayload(skillRows);
  const currentLanguages = buildLanguagesPayload(languageRows);
  const previousSkills = profile.skills.trim() || "Sin registros";
  const previousLanguages = profile.languages.trim() || "Sin registros";
  const nextSkills = currentSkills.trim() || "Sin registros";
  const nextLanguages = currentLanguages.trim() || "Sin registros";

  const changes: ReviewChangeItem[] = [];
  if (currentSkills !== profile.skills) {
    changes.push({
      label: "Habilidades",
      previous: previousSkills,
      next: nextSkills,
    });
  }

  if (currentLanguages !== profile.languages) {
    changes.push({
      label: "Idiomas",
      previous: previousLanguages,
      next: nextLanguages,
    });
  }

  return changes;
}

export function CompetenciesForm({ profile }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2>(1);
  const [reviewChanges, setReviewChanges] = useState<ReviewChangeItem[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<CompetenciesErrors>({});

  const [skillRows, setSkillRows] = useState<SkillRow[]>(() => parseSkillRows(profile.skills));
  const [languageRows, setLanguageRows] = useState<LanguageRow[]>(() => parseLanguageRows(profile.languages));

  const hasChanges = useMemo(() => {
    const currentSkills = buildSkillsPayload(skillRows);
    const currentLanguages = buildLanguagesPayload(languageRows);
    return currentSkills !== profile.skills || currentLanguages !== profile.languages;
  }, [skillRows, languageRows, profile]);

  const clearFieldError = (field: keyof CompetenciesErrors) => {
    if (!errors[field]) return;
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const updateSkillRow = (id: string, patch: Partial<SkillRow>) => {
    setSkillRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        return {
          ...row,
          ...patch,
          level: patch.level !== undefined ? normalizeSkillLevel(patch.level) : row.level,
        };
      }),
    );
    clearFieldError("skills");
  };

  const removeSkillRow = (id: string) => {
    setSkillRows((prev) => prev.filter((row) => row.id !== id));
    clearFieldError("skills");
  };

  const addSkillRow = () => {
    setSkillRows((prev) => [...prev, { id: buildRowId("skill"), name: "", level: "70" }]);
    clearFieldError("skills");
  };

  const updateLanguageRow = (id: string, patch: Partial<LanguageRow>) => {
    setLanguageRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        return {
          ...row,
          ...patch,
          level:
            patch.level && LANGUAGE_LEVELS.includes(patch.level)
              ? patch.level
              : row.level,
        };
      }),
    );
    clearFieldError("languages");
  };

  const removeLanguageRow = (id: string) => {
    setLanguageRows((prev) => prev.filter((row) => row.id !== id));
    clearFieldError("languages");
  };

  const addLanguageRow = () => {
    setLanguageRows((prev) => [
      ...prev,
      {
        id: buildRowId("lang"),
        name: "",
        level: "A1",
        certification: "",
      },
    ]);
    clearFieldError("languages");
  };

  const requestSave = () => {
    if (!profile.canEditCompetencies) {
      setSubmitMessage(`Proxima edicion: ${formatNextProfileEditDate(profile.nextCompetenciesEditAt)}`);
      return;
    }

    if (!hasChanges) {
      setSubmitMessage("No hay cambios para guardar.");
      return;
    }

    const validationErrors = validateCompetenciesInput({
      skills: buildSkillsPayload(skillRows),
      languages: buildLanguagesPayload(languageRows),
      currentPassword: "tmpPass123A",
    });
    validationErrors.currentPassword = undefined;
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      setSubmitMessage(null);
      return;
    }

    const changes = buildReviewChanges(profile, skillRows, languageRows);
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
      skills: buildSkillsPayload(skillRows),
      languages: buildLanguagesPayload(languageRows),
      currentPassword,
    };

    const validationErrors = validateCompetenciesInput(input);
    const modalError = validationErrors.currentPassword;
    validationErrors.currentPassword = undefined;
    setErrors(validationErrors);

    if (hasErrors(validationErrors) || modalError) {
      setConfirmError(modalError ?? null);
      return;
    }

    setConfirmError(null);
    startTransition(async () => {
      const result = await updateSuperAdminMeCompetenciesAction(input);
      if (!result.success) {
        setConfirmError(result.error ?? "Error al actualizar");
        return;
      }
      toast.success("Competencias actualizadas correctamente");
      setConfirmOpen(false);
      setStep(1);
      setReviewChanges([]);
      setSubmitMessage(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        {step === 1 ? (
          <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
            {/* Habilidades */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="size-5 text-muted-foreground" />
                  <div>
                    <Label className="text-base">Habilidades</Label>
                    <p className="text-sm text-muted-foreground">Máximo 10</p>
                  </div>
                </div>
                <Badge variant="outline">{skillRows.length}/{MAX_SKILLS}</Badge>
              </div>

              <div className="space-y-3">
                {skillRows.map((row, idx) => (
                  <div key={row.id} className="flex items-end gap-3 rounded-2xl bg-muted/30 p-4">
                    <div className="flex-1 space-y-2">
                      <Label>Habilidad {idx + 1}</Label>
                      <Input
                        value={row.name}
                        placeholder="Liderazgo"
                        maxLength={MAX_ENTRY_NAME_LENGTH}
                        disabled={!profile.canEditCompetencies}
                        onChange={(e) =>
                          updateSkillRow(row.id, {
                            name: sanitizeHumanEntry(e.target.value, MAX_ENTRY_NAME_LENGTH),
                          })
                        }
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label>Nivel (%)</Label>
                      <Input
                        value={row.level}
                        placeholder="85"
                        inputMode="numeric"
                        maxLength={3}
                        disabled={!profile.canEditCompetencies}
                        onChange={(e) => updateSkillRow(row.id, { level: e.target.value })}
                      />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => removeSkillRow(row.id)} disabled={!profile.canEditCompetencies}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="outline" onClick={addSkillRow} disabled={skillRows.length >= MAX_SKILLS || !profile.canEditCompetencies}>
                <Plus className="size-4 mr-2" /> Agregar habilidad
              </Button>
              <FieldError message={errors.skills} />
            </section>

            {/* Idiomas */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="size-5 text-muted-foreground" />
                  <div>
                    <Label className="text-base">Idiomas</Label>
                    <p className="text-sm text-muted-foreground">Máximo 10</p>
                  </div>
                </div>
                <Badge variant="outline">{languageRows.length}/{MAX_LANGUAGES}</Badge>
              </div>

              <div className="space-y-3">
                {languageRows.map((row, idx) => (
                  <div key={row.id} className="space-y-3 rounded-2xl bg-muted/30 p-4">
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px]">
                      <div className="space-y-2">
                        <Label>Idioma {idx + 1}</Label>
                        <Input
                          value={row.name}
                          placeholder="Ingles"
                          maxLength={MAX_ENTRY_NAME_LENGTH}
                          disabled={!profile.canEditCompetencies}
                          onChange={(e) =>
                            updateLanguageRow(row.id, {
                              name: sanitizeHumanEntry(e.target.value, MAX_ENTRY_NAME_LENGTH),
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Nivel CEFR</Label>
                        <Select
                          value={row.level}
                          onValueChange={(value) =>
                            updateLanguageRow(row.id, {
                              level: value as (typeof LANGUAGE_LEVELS)[number],
                            })
                          }
                          disabled={!profile.canEditCompetencies}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGE_LEVELS.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-end gap-3">
                      <div className="flex-1 space-y-2">
                        <Label>Certificación</Label>
                        <Input
                          value={row.certification}
                          placeholder="IELTS"
                          maxLength={MAX_CERTIFICATION_LENGTH}
                          disabled={!profile.canEditCompetencies}
                          onChange={(e) =>
                            updateLanguageRow(row.id, {
                              certification: sanitizeCertificationEntry(e.target.value),
                            })
                          }
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeLanguageRow(row.id)}
                        disabled={!profile.canEditCompetencies}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" onClick={addLanguageRow} disabled={languageRows.length >= MAX_LANGUAGES || !profile.canEditCompetencies}>
                <Plus className="mr-2 size-4" /> Agregar idioma
              </Button>
              <FieldError message={errors.languages} />
            </section>
          </div>
        ) : (
          <ReviewChangesPanel title="Resumen de cambios en competencias" description="Verifica antes de confirmar." changes={reviewChanges} />
        )}

        {submitMessage ? <p className="text-sm text-muted-foreground">{submitMessage}</p> : null}

        <div className="mt-8 flex justify-end gap-4">
          {step === 2 ? (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>Volver</Button>
              <Button onClick={() => setConfirmOpen(true)} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
                Confirmar cambios
              </Button>
            </>
          ) : (
            <Button onClick={requestSave} disabled={isPending || !profile.canEditCompetencies}>
              Revisar cambios
            </Button>
          )}
        </div>
      </div>

      <PasswordConfirmModal
        open={confirmOpen}
        title="Confirmar cambios"
        description="¿Estas seguro de confirmar estos cambios? Ingresa tu contraseña actual para continuar."
        sectionTitle="Editar competencias"
        sectionSummary="Gestiona habilidades e idiomas de forma estructurada."
        policyNotice={`Al confirmar, el proximo cambio de esta seccion se habilitara en 3 meses. Proxima edicion disponible: ${formatNextProfileEditDate(profile.nextCompetenciesEditAt)}.`}
        confirmLabel="Si, confirmar cambios"
        isPending={isPending}
        errorMessage={confirmError}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmSave}
      />
    </>
  );
}

// Funciones auxiliares parse/build/add/remove se mantienen de tu código original (limpias)