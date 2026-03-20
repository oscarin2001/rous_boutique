import { z } from "zod";

import { BOLIVIA_PHONE_REGEX } from "@/lib/bolivia";
import { HUMAN_NAME_REGEX, parseIsoDate } from "@/lib/field-validation";

function hasMinimumAge(date: Date, years: number): boolean {
  const today = new Date();
  const limitDate = new Date(Date.UTC(today.getUTCFullYear() - years, today.getUTCMonth(), today.getUTCDate()));
  return date <= limitDate;
}

export const createSuperAdminAccountSchema = z.object({
  currentPassword: z.string().min(1, "Ingresa tu contrasena actual").max(72),
  firstName: z.string().trim().min(2).max(30).regex(HUMAN_NAME_REGEX, "Nombre invalido"),
  lastName: z.string().trim().min(2).max(30).regex(HUMAN_NAME_REGEX, "Apellido invalido"),
  birthDate: z.string().trim().min(1, "Ingresa la fecha de nacimiento"),
  ci: z.string().trim().regex(/^[A-Za-z0-9-]{5,20}$/, "CI invalido"),
  phone: z.string().trim().optional().or(z.literal("")).refine((v) => !v || BOLIVIA_PHONE_REGEX.test(v), "Telefono invalido"),
  username: z.string().trim().toLowerCase().min(3).max(60).regex(/^[a-z0-9._@-]+$/, "Usuario invalido"),
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres")
    .max(72, "La contrasena no puede exceder 72 caracteres")
    .regex(/[A-Z]/, "Debe incluir mayuscula")
    .regex(/[a-z]/, "Debe incluir minuscula")
    .regex(/[0-9]/, "Debe incluir numero"),
  passwordConfirm: z.string().min(8).max(72),
}).superRefine((data, ctx) => {
  const birthDate = parseIsoDate(data.birthDate);
  if (!birthDate) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birthDate"], message: "Fecha de nacimiento invalida" });
  } else if (!hasMinimumAge(birthDate, 18)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birthDate"], message: "Debe ser mayor de 18 anos" });
  }
  if (data.password !== data.passwordConfirm) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["passwordConfirm"], message: "La confirmacion no coincide" });
  }
});

export type CreateSuperAdminAccountInput = z.infer<typeof createSuperAdminAccountSchema>;
