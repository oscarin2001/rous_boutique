"use client";

import { useMemo, useState, useTransition } from "react";

import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "next/navigation";

import {
  truncateInput,
  updateSuperAdminMeCompetenciesAction,
  validateCompetenciesInput,
  type EditableProfile,
} from "@/actions/super-admin/me";

import {
  EditStepsHeader,
  ReviewChangesPanel,
  type ReviewChangeItem,
} from "@/components/super-admin/dashboard/me/shared/edit-review";
import { FieldError } from "@/components/super-admin/dashboard/me/shared/field-error";
import { PasswordConfirmModal } from "@/components/super-admin/dashboard/me/shared/password-confirm-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  profile: EditableProfile;
};

type CompetenciesErrors = ReturnType<typeof validateCompetenciesInput>;

type SkillRow = {
  id: string;
  name: string;
  level: string;
};

const LANGUAGE_LEVEL_OPTIONS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type LanguageLevel = (typeof LANGUAGE_LEVEL_OPTIONS)[number];

type LanguageRow = {
  id: string;
  name: string;
  level: LanguageLevel;
  certification: string;
};

const MAX_SKILLS_ENTRIES = 10;
const MAX_LANGUAGES_ENTRIES = 10;
const SKILL_NAME_REGEX = /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F .'-]{1,39}$/;
const SKILL_LEVEL_REGEX = /^(100|[1-9]?\d)$/;
const LANGUAGE_NAME_REGEX = /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F .'-]{1,39}$/;
const LANGUAGE_CERTIFICATION_REGEX = /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F .'-]{1,59}$/;

function createRowId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function normalizeEntryText(value: string) {
  return value.replace(/[\n\r]/g, " ").replace(/[:,]/g, "").replace(/\s{2,}/g, " ").trimStart();
}

function sanitizeHumanEntry(value: string, maxLength: number) {
  const cleaned = normalizeEntryText(value).replace(/[^A-Za-z\u00C0-\u024F .'-]/g, "");
  return truncateInput(cleaned, maxLength);
}

function sanitizeSkillLevel(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 3);
  if (!digits) return "";
  return String(Math.min(100, Number(digits)));
}

function createEmptySkillRow(): SkillRow {
  return {
    id: createRowId(),
    name: "",
    level: "",
  };
}

function createEmptyLanguageRow(): LanguageRow {
  return {
    id: createRowId(),
    name: "",
    level: "A1",
    certification: "",
  };
}

function parseSkillRows(raw: string): SkillRow[] {
  const entries = raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [namePart, levelPart] = chunk.split(":");
      return {
        id: createRowId(),
        name: sanitizeHumanEntry((namePart ?? "").trim(), 40),
        level: sanitizeSkillLevel((levelPart ?? "").trim()),
      };
    })
    .filter((item) => item.name || item.level);

  return entries.length ? entries : [createEmptySkillRow()];
}

function parseLanguageRows(raw: string): LanguageRow[] {
  const entries = raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [namePart, levelPart, certificationPart] = chunk.split(":");
      const parsedLevel = (levelPart ?? "").toUpperCase();
      const level = LANGUAGE_LEVEL_OPTIONS.includes(parsedLevel as LanguageLevel)
        ? (parsedLevel as LanguageLevel)
        : "A1";

      return {
        id: createRowId(),
        name: sanitizeHumanEntry((namePart ?? "").trim(), 40),
        level,
        certification: sanitizeHumanEntry((certificationPart ?? "").trim(), 60),
      };
    })
    .filter((item) => item.name || item.certification);

  return entries.length ? entries : [createEmptyLanguageRow()];
}

function buildSkillsPayload(rows: SkillRow[]) {
  return rows
    .map((row) => ({
      name: row.name.trim(),
      level: row.level.trim(),
    }))
    .filter((row) => row.name || row.level)
    .map((row) => `${row.name}:${row.level}`)
    .join(", ");
}

function buildLanguagesPayload(rows: LanguageRow[]) {
  return rows
    .map((row) => ({
      name: row.name.trim(),
      level: row.level.trim(),
      certification: row.certification.trim(),
    }))
    .filter((row) => row.name || row.certification)
    .map((row) => `${row.name}:${row.level}:${row.certification}`)
    .join(", ");
}

function normalizeListString(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .join(", ");
}

function countActiveSkillRows(rows: SkillRow[]) {
  return rows.filter((row) => row.name.trim() || row.level.trim()).length;
}

function countActiveLanguageRows(rows: LanguageRow[]) {
  return rows.filter((row) => row.name.trim() || row.certification.trim()).length;
}

function serializeSkillsForReview(rows: SkillRow[]) {
  const items = rows
    .map((row) => ({
      name: row.name.trim(),
      level: row.level.trim(),
    }))
    .filter((row) => row.name || row.level)
    .map((row) => `${row.name} - ${row.level}%`);

  return items.length ? items.join("\n") : "Sin habilidades registradas";
}

function serializeLanguagesForReview(rows: LanguageRow[]) {
  const items = rows
    .map((row) => ({
      name: row.name.trim(),
      level: row.level.trim(),
      certification: row.certification.trim(),
    }))
    .filter((row) => row.name || row.certification)
    .map((row) => `${row.name} - ${row.level} - ${row.certification}`);

  return items.length ? items.join("\n") : "Sin idiomas registrados";
}

function buildReviewChanges(
  baselineSkillRows: SkillRow[],
  baselineLanguageRows: LanguageRow[],
  skillRows: SkillRow[],
  languageRows: LanguageRow[],
): ReviewChangeItem[] {
  const changes: ReviewChangeItem[] = [];

  const currentSkills = serializeSkillsForReview(baselineSkillRows);
  const nextSkills = serializeSkillsForReview(skillRows);
  if (currentSkills !== nextSkills) {
    changes.push({
      label: "Habilidades",
      previous: currentSkills,
      next: nextSkills,
    });
  }

  const currentLanguages = serializeLanguagesForReview(baselineLanguageRows);
  const nextLanguages = serializeLanguagesForReview(languageRows);
  if (currentLanguages !== nextLanguages) {
    changes.push({
      label: "Idiomas",
      previous: currentLanguages,
      next: nextLanguages,
    });
  }

  return changes;
}

function validateStructuredRows(
  skillRows: SkillRow[],
  languageRows: LanguageRow[],
): Pick<CompetenciesErrors, "skills" | "languages"> {
  const errors: Pick<CompetenciesErrors, "skills" | "languages"> = {};

  const activeSkills = skillRows
    .map((row) => ({
      name: row.name.trim(),
      level: row.level.trim(),
    }))
    .filter((row) => row.name || row.level);

  if (activeSkills.length > MAX_SKILLS_ENTRIES) {
    errors.skills = `Puedes registrar maximo ${MAX_SKILLS_ENTRIES} habilidades`;
  } else if (activeSkills.some((row) => !row.name || !row.level)) {
    errors.skills = "Completa nombre y porcentaje en cada habilidad.";
  } else if (activeSkills.some((row) => !SKILL_NAME_REGEX.test(row.name) || !SKILL_LEVEL_REGEX.test(row.level))) {
    errors.skills = "Cada habilidad debe tener nombre valido (solo letras) y porcentaje entre 0 y 100.";
  }

  const activeLanguages = languageRows
    .map((row) => ({
      name: row.name.trim(),
      level: row.level.trim(),
      certification: row.certification.trim(),
    }))
    .filter((row) => row.name || row.certification);

  if (activeLanguages.length > MAX_LANGUAGES_ENTRIES) {
    errors.languages = `Puedes registrar maximo ${MAX_LANGUAGES_ENTRIES} idiomas`;
  } else if (activeLanguages.some((row) => !row.name || !row.level || !row.certification)) {
    errors.languages = "Completa idioma, nivel y certificacion en cada fila.";
  } else if (activeLanguages.some((row) => !LANGUAGE_NAME_REGEX.test(row.name))) {
    errors.languages = "Cada idioma debe tener un nombre valido (solo letras, 2-40).";
  } else if (activeLanguages.some((row) => !LANGUAGE_CERTIFICATION_REGEX.test(row.certification))) {
    errors.languages = "La certificacion solo permite letras y espacios (sin numeros).";
  }

  return errors;
}

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

export function CompetenciesForm({ profile }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2>(1);
  const [reviewChanges, setReviewChanges] = useState<ReviewChangeItem[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<CompetenciesErrors>({});

  const baselineSkillRows = useMemo(() => parseSkillRows(profile.skills), [profile.skills]);
  const baselineLanguageRows = useMemo(() => parseLanguageRows(profile.languages), [profile.languages]);
  const [skillRows, setSkillRows] = useState<SkillRow[]>(() => parseSkillRows(profile.skills));
  const [languageRows, setLanguageRows] = useState<LanguageRow[]>(() => parseLanguageRows(profile.languages));

  const skills = useMemo(() => buildSkillsPayload(skillRows), [skillRows]);
  const languages = useMemo(() => buildLanguagesPayload(languageRows), [languageRows]);
  const baselineSkills = useMemo(() => normalizeListString(profile.skills), [profile.skills]);
  const baselineLanguages = useMemo(() => normalizeListString(profile.languages), [profile.languages]);

  const hasChanges =
    normalizeListString(skills) !== baselineSkills ||
    normalizeListString(languages) !== baselineLanguages;

  const clearFieldError = (field: keyof CompetenciesErrors) => {
    if (!errors[field]) return;
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setSkillField = (id: string, next: Partial<Omit<SkillRow, "id">>) => {
    setSkillRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...next } : row)));
    clearFieldError("skills");
  };

  const addSkillRow = () => {
    if (skillRows.length >= MAX_SKILLS_ENTRIES) {
      setErrors((prev) => ({ ...prev, skills: `Puedes registrar maximo ${MAX_SKILLS_ENTRIES} habilidades` }));
      return;
    }
    setSkillRows((prev) => [...prev, createEmptySkillRow()]);
    clearFieldError("skills");
  };

  const removeSkillRow = (id: string) => {
    setSkillRows((prev) => {
      const next = prev.filter((row) => row.id !== id);
      return next.length ? next : [createEmptySkillRow()];
    });
    clearFieldError("skills");
  };

  const setLanguageField = (id: string, next: Partial<Omit<LanguageRow, "id">>) => {
    setLanguageRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...next } : row)));
    clearFieldError("languages");
  };

  const addLanguageRow = () => {
    if (languageRows.length >= MAX_LANGUAGES_ENTRIES) {
      setErrors((prev) => ({ ...prev, languages: `Puedes registrar maximo ${MAX_LANGUAGES_ENTRIES} idiomas` }));
      return;
    }
    setLanguageRows((prev) => [...prev, createEmptyLanguageRow()]);
    clearFieldError("languages");
  };

  const removeLanguageRow = (id: string) => {
    setLanguageRows((prev) => {
      const next = prev.filter((row) => row.id !== id);
      return next.length ? next : [createEmptyLanguageRow()];
    });
    clearFieldError("languages");
  };

  const requestSave = () => {
    if (!profile.canEditCompetencies) {
      setSubmitMessage(`Podras editar competencias nuevamente desde ${formatNextProfileEditDate(profile.nextCompetenciesEditAt)}.`);
      return;
    }

    if (!hasChanges) {
      setSubmitMessage("No hay cambios para guardar.");
      return;
    }

    const structuredErrors = validateStructuredRows(skillRows, languageRows);
    const validationErrors = validateCompetenciesInput({
      skills,
      languages,
      currentPassword: "tmpPass123A",
    });
    validationErrors.currentPassword = undefined;

    const mergedErrors: CompetenciesErrors = {
      ...validationErrors,
      ...structuredErrors,
    };

    setErrors(mergedErrors);

    if (hasErrors(mergedErrors)) {
      setSubmitMessage(null);
      return;
    }

    const changes = buildReviewChanges(baselineSkillRows, baselineLanguageRows, skillRows, languageRows);
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
      skills,
      languages,
      currentPassword,
    };

    const structuredErrors = validateStructuredRows(skillRows, languageRows);
    const validationErrors = validateCompetenciesInput(input);
    const modalError = validationErrors.currentPassword;
    validationErrors.currentPassword = undefined;

    const mergedErrors: CompetenciesErrors = {
      ...validationErrors,
      ...structuredErrors,
    };

    setErrors(mergedErrors);

    if (hasErrors(mergedErrors) || modalError) {
      setConfirmError(modalError ?? null);
      setSubmitMessage(null);
      return;
    }

    setConfirmError(null);
    startTransition(async () => {
      const result = await updateSuperAdminMeCompetenciesAction(input);

      if (!result.success) {
        const message = result.error ?? "No se pudo actualizar";
        setConfirmError(message);
        return;
      }

      toast.success("Competencias actualizadas");
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
          firstTitle="Editar competencias"
          firstDescription="Gestiona habilidades e idiomas desde filas claras, sin formato manual confuso."
          secondTitle="Revisar competencias"
          secondDescription="Comprueba el resumen de la seccion y confirma desde el modal con tu contrasena actual."
        />

        {!profile.canEditCompetencies ? (
          <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
            <Badge variant="outline">Anuncio</Badge>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Esta seccion se puede editar cada 3 meses. Proxima edicion disponible: {formatNextProfileEditDate(profile.nextCompetenciesEditAt)}.
            </p>
          </div>
        ) : null}

        {step === 1 ? (
          <>
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <Label>Habilidades</Label>
                  <p className="text-sm text-muted-foreground">Agrega cada habilidad con su porcentaje de dominio.</p>
                </div>
                <Badge variant="outline">{countActiveSkillRows(skillRows)}/{MAX_SKILLS_ENTRIES}</Badge>
              </div>

              <div className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4">
                {skillRows.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-1 gap-3 rounded-xl border border-border/50 bg-card p-3 md:grid-cols-[1fr_140px_auto]">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Habilidad {index + 1}</Label>
                      <Input
                        value={row.name}
                        disabled={!profile.canEditCompetencies}
                        placeholder="Ej. Liderazgo"
                        onChange={(event) => {
                          setSkillField(row.id, {
                            name: sanitizeHumanEntry(event.target.value, 40),
                          });
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Nivel %</Label>
                      <Input
                        value={row.level}
                        disabled={!profile.canEditCompetencies}
                        inputMode="numeric"
                        placeholder="0-100"
                        onChange={(event) => {
                          setSkillField(row.id, {
                            level: sanitizeSkillLevel(event.target.value),
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={!profile.canEditCompetencies}
                        onClick={() => removeSkillRow(row.id)}
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Eliminar habilidad</span>
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">Solo se aceptan nombres validos y porcentaje entre 0 y 100.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!profile.canEditCompetencies || skillRows.length >= MAX_SKILLS_ENTRIES}
                    onClick={addSkillRow}
                  >
                    <Plus className="size-4" />
                    Agregar habilidad
                  </Button>
                </div>
              </div>

              <FieldError message={errors.skills} />
            </section>

            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <Label>Idiomas</Label>
                  <p className="text-sm text-muted-foreground">Registra idioma, nivel y certificacion sin numeros en el nombre.</p>
                </div>
                <Badge variant="outline">{countActiveLanguageRows(languageRows)}/{MAX_LANGUAGES_ENTRIES}</Badge>
              </div>

              <div className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4">
                {languageRows.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-1 gap-3 rounded-xl border border-border/50 bg-card p-3 md:grid-cols-[1fr_120px_1fr_auto]">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Idioma {index + 1}</Label>
                      <Input
                        value={row.name}
                        disabled={!profile.canEditCompetencies}
                        placeholder="Ej. Ingles"
                        onChange={(event) => {
                          setLanguageField(row.id, {
                            name: sanitizeHumanEntry(event.target.value, 40),
                          });
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Nivel</Label>
                      <Select
                        value={row.level}
                        disabled={!profile.canEditCompetencies}
                        onValueChange={(value) => {
                          setLanguageField(row.id, {
                            level: (value as LanguageLevel) ?? "A1",
                          });
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGE_LEVEL_OPTIONS.map((levelOption) => (
                            <SelectItem key={levelOption} value={levelOption}>
                              {levelOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Certificacion</Label>
                      <Input
                        value={row.certification}
                        disabled={!profile.canEditCompetencies}
                        placeholder="Ej. Nativo"
                        onChange={(event) => {
                          setLanguageField(row.id, {
                            certification: sanitizeHumanEntry(event.target.value, 60),
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={!profile.canEditCompetencies}
                        onClick={() => removeLanguageRow(row.id)}
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Eliminar idioma</span>
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">La certificacion solo admite texto como Nativo, IELTS o DELE.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!profile.canEditCompetencies || languageRows.length >= MAX_LANGUAGES_ENTRIES}
                    onClick={addLanguageRow}
                  >
                    <Plus className="size-4" />
                    Agregar idioma
                  </Button>
                </div>
              </div>

              <FieldError message={errors.languages} />
            </section>
          </>
        ) : (
          <ReviewChangesPanel
            title="Resumen de cambios en competencias"
            description="Verifica habilidades e idiomas antes de confirmar. Al finalizar, esta seccion quedara bloqueada por 3 meses."
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
            <Button onClick={requestSave} disabled={isPending || !profile.canEditCompetencies}>
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
