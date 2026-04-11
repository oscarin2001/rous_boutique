import { z } from "zod";

const HUMAN_ENTRY_PART = "[A-Za-z\\u00C0-\\u024F][A-Za-z\\u00C0-\\u024F .'-]{1,39}";
const CERT_ENTRY_PART = "[A-Za-z\\u00C0-\\u024F][A-Za-z\\u00C0-\\u024F .'-]{1,59}";
const SKILL_ENTRY_REGEX = new RegExp(`^\\s*${HUMAN_ENTRY_PART}\\s*:\\s*(100|[1-9]?\\d)\\s*$`, "i");
const LANGUAGE_ENTRY_REGEX = new RegExp(`^\\s*${HUMAN_ENTRY_PART}\\s*:\\s*(A1|A2|B1|B2|C1|C2)\\s*:\\s*${CERT_ENTRY_PART}\\s*$`, "i");
const MAX_SKILLS_ENTRIES = 10;

export const competenciesSectionSchema = z.object({
  skills: z.string().trim().max(300, "Habilidades no puede exceder 300 caracteres").optional().or(z.literal("")),
  languages: z.string().trim().max(500, "Idiomas no puede exceder 500 caracteres").optional().or(z.literal("")),
  currentPassword: z.string().min(1, "Ingresa tu contrasena actual").max(72),
}).superRefine((data, ctx) => {
  if (data.skills) {
    const entries = data.skills.split(",").map((item) => item.trim()).filter(Boolean);
    if (entries.length > MAX_SKILLS_ENTRIES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["skills"],
        message: `Puedes registrar maximo ${MAX_SKILLS_ENTRIES} habilidades`,
      });
    }
    if (entries.some((entry) => !SKILL_ENTRY_REGEX.test(entry))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["skills"],
        message: "Formato de habilidades invalido. Usa Nombre:80 (sin numeros en el nombre)",
      });
    }
  }

  if (data.languages) {
    const entries = data.languages.split(",").map((item) => item.trim()).filter(Boolean);
    if (entries.some((entry) => !LANGUAGE_ENTRY_REGEX.test(entry))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["languages"],
        message: "Formato de idiomas invalido. Usa Espanol:C2:Nativo, Ingles:B2:IELTS (sin numeros en nombre/certificacion)",
      });
    }
  }
});

export type CompetenciesSectionSchemaInput = z.infer<typeof competenciesSectionSchema>;
