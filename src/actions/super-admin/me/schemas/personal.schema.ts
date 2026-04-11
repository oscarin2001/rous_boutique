import { z } from "zod";

import { BOLIVIA_PHONE_REGEX } from "@/lib/bolivia";
import { HUMAN_NAME_REGEX, parseIsoDate } from "@/lib/field-validation";

function hasMinimumAge(date: Date, years: number): boolean {
  const today = new Date();
  const limitDate = new Date(Date.UTC(today.getUTCFullYear() - years, today.getUTCMonth(), today.getUTCDate()));
  return date <= limitDate;
}

export const personalSectionSchema = z.object({
  firstName: z.string().trim().min(2).max(30).regex(HUMAN_NAME_REGEX, "Nombre invalido"),
  lastName: z.string().trim().min(2).max(30).regex(HUMAN_NAME_REGEX, "Apellido invalido"),
  birthDate: z.string().trim().min(1, "Ingresa la fecha de nacimiento"),
  phone: z.string().trim().optional().or(z.literal("")).refine((v) => !v || BOLIVIA_PHONE_REGEX.test(v), "Telefono invalido"),
  ci: z.string().trim().regex(/^[A-Za-z0-9-]{5,20}$/, "CI invalido"),
  profession: z.string().trim().max(80, "Profesion demasiado larga").optional().or(z.literal("")),
  aboutMe: z.string().trim().max(600, "Acerca de mi no puede exceder 600 caracteres").optional().or(z.literal("")),
  currentPassword: z.string().min(1, "Ingresa tu contrasena actual").max(72),
}).superRefine((data, ctx) => {
  const birthDate = parseIsoDate(data.birthDate);
  if (!birthDate) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birthDate"], message: "Fecha de nacimiento invalida" });
    return;
  }
  if (birthDate > new Date()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birthDate"], message: "La fecha de nacimiento no puede ser futura" });
  }
  if (!hasMinimumAge(birthDate, 18)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birthDate"], message: "Debe ser mayor de 18 anos" });
  }
  if (data.profession && /\d/.test(data.profession)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["profession"], message: "La profesion no debe incluir numeros" });
  }
  if (data.aboutMe && data.aboutMe.trim().length < 30) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["aboutMe"], message: "Acerca de mi debe tener al menos 30 caracteres" });
  }
});

export type PersonalSectionSchemaInput = z.infer<typeof personalSectionSchema>;
