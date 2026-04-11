import { z } from "zod";

import { BOLIVIA_PHONE_REGEX } from "@/lib/bolivia";
import { HUMAN_NAME_REGEX, parseIsoDate } from "@/lib/field-validation";

function hasMinimumAge(date: Date, years: number): boolean {
  const today = new Date();
  const limitDate = new Date(Date.UTC(today.getUTCFullYear() - years, today.getUTCMonth(), today.getUTCDate()));
  return date <= limitDate;
}

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(30).regex(HUMAN_NAME_REGEX, "Nombre invalido"),
  lastName: z.string().trim().min(2).max(30).regex(HUMAN_NAME_REGEX, "Apellido invalido"),
  birthDate: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")).refine((v) => !v || BOLIVIA_PHONE_REGEX.test(v), "Telefono invalido"),
  ci: z.string().trim().regex(/^[A-Za-z0-9-]{5,20}$/, "CI invalido"),
  profession: z.string().trim().max(80, "Profesion demasiado larga").optional().or(z.literal("")),
  photoUrl: z
    .string()
    .trim()
    .max(300, "URL de foto demasiado larga")
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https?:\/\//i.test(v) || v.startsWith("/"), "URL de foto invalida"),
  aboutMe: z.string().trim().max(600, "Acerca de mi no puede exceder 600 caracteres").optional().or(z.literal("")),
  skills: z.string().trim().max(300, "Habilidades no puede exceder 300 caracteres").optional().or(z.literal("")),
  languages: z.string().trim().max(500, "Idiomas no puede exceder 500 caracteres").optional().or(z.literal("")),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(60, "El usuario no puede exceder 60 caracteres")
    .regex(/^[a-z0-9._@-]+$/, "Usuario invalido"),
  currentPassword: z.string().min(1, "Ingresa tu contrasena actual").max(72),
  newPassword: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres")
    .max(72, "La contrasena no puede exceder 72 caracteres")
    .regex(/[A-Z]/, "Debe incluir mayuscula")
    .regex(/[a-z]/, "Debe incluir minuscula")
    .regex(/[0-9]/, "Debe incluir numero")
    .optional()
    .or(z.literal("")),
  newPasswordConfirm: z.string().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  if (data.birthDate) {
    const birthDate = parseIsoDate(data.birthDate);
    if (!birthDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birthDate"], message: "Fecha de nacimiento invalida" });
    } else {
      if (birthDate > new Date()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birthDate"], message: "La fecha de nacimiento no puede ser futura" });
      }
      if (!hasMinimumAge(birthDate, 18)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birthDate"], message: "Debe ser mayor de 18 anos" });
      }
    }
  }

  const hasPassword = !!data.newPassword;
  const hasConfirm = !!data.newPasswordConfirm;
  if (hasPassword && !hasConfirm) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["newPasswordConfirm"], message: "Confirma la nueva contrasena" });
  }
  if (!hasPassword && hasConfirm) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["newPasswordConfirm"], message: "Ingresa primero la nueva contrasena" });
  }
  if (hasPassword && hasConfirm && data.newPassword !== data.newPasswordConfirm) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["newPasswordConfirm"], message: "La confirmacion no coincide" });
  }
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
