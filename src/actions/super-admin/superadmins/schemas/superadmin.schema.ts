import { z } from "zod";

import { BOLIVIA_PHONE_REGEX } from "@/lib/bolivia";
import { HUMAN_NAME_REGEX, parseIsoDate } from "@/lib/field-validation";

const usernameField = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Usuario invalido")
  .max(60, "Usuario invalido")
  .regex(/^[a-z0-9._@-]+$/, "Usuario invalido");

const birthDateField = z
  .string()
  .trim()
  .min(1, "La fecha de nacimiento es obligatoria")
  .refine((value) => parseIsoDate(value) !== null, "Fecha invalida");

function hasMinimumAge(value: string, years: number) {
  const date = parseIsoDate(value);
  if (!date) return false;
  const today = new Date();
  const limitDate = new Date(
    Date.UTC(today.getUTCFullYear() - years, today.getUTCMonth(), today.getUTCDate()),
  );
  return date <= limitDate;
}

export const createSuperAdminSchema = z
  .object({
    firstName: z.string().trim().min(2).max(30).regex(HUMAN_NAME_REGEX, "Nombre invalido"),
    lastName: z.string().trim().min(2).max(30).regex(HUMAN_NAME_REGEX, "Apellido invalido"),
    birthDate: birthDateField,
    ci: z.string().trim().regex(/^[A-Za-z0-9-]{5,20}$/, "CI invalido"),
    phone: z.string().trim().optional().or(z.literal("")).refine((value) => !value || BOLIVIA_PHONE_REGEX.test(value), "Telefono invalido"),
    username: usernameField,
    password: z
      .string()
      .min(8, "La contrasena debe tener al menos 8 caracteres")
      .max(72, "La contrasena no puede exceder 72 caracteres")
      .regex(/[A-Z]/, "Debe incluir mayuscula")
      .regex(/[a-z]/, "Debe incluir minuscula")
      .regex(/[0-9]/, "Debe incluir numero"),
    passwordConfirm: z.string().trim().min(1, "Confirma la contrasena"),
    adminConfirmPassword: z.string().trim().min(1, "Ingresa tu contrasena de confirmacion"),
  })
  .superRefine((data, ctx) => {
    if (!hasMinimumAge(data.birthDate, 18)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthDate"],
        message: "Debe tener al menos 18 anos",
      });
    }
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["passwordConfirm"],
        message: "La confirmacion de contrasena no coincide",
      });
    }
  });

export const updateSuperAdminSchema = z
  .object({
    firstName: z.string().trim().min(2).max(30).regex(HUMAN_NAME_REGEX, "Nombre invalido"),
    lastName: z.string().trim().min(2).max(30).regex(HUMAN_NAME_REGEX, "Apellido invalido"),
    birthDate: birthDateField,
    ci: z.string().trim().regex(/^[A-Za-z0-9-]{5,20}$/, "CI invalido"),
    phone: z.string().trim().optional().or(z.literal("")).refine((value) => !value || BOLIVIA_PHONE_REGEX.test(value), "Telefono invalido"),
    username: usernameField,
    newPassword: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || value.length >= 8, "Minimo 8 caracteres")
      .refine((value) => !value || value.length <= 72, "Maximo 72 caracteres")
      .refine((value) => !value || /[A-Z]/.test(value), "Debe incluir mayuscula")
      .refine((value) => !value || /[a-z]/.test(value), "Debe incluir minuscula")
      .refine((value) => !value || /[0-9]/.test(value), "Debe incluir numero"),
    newPasswordConfirm: z.string().trim().optional().or(z.literal("")),
    adminConfirmPassword: z.string().trim().min(1, "Ingresa tu contrasena de confirmacion"),
  })
  .superRefine((data, ctx) => {
    if (!hasMinimumAge(data.birthDate, 18)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthDate"],
        message: "Debe tener al menos 18 anos",
      });
    }
    if (data.newPassword && !data.newPasswordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPasswordConfirm"],
        message: "Confirma la nueva contrasena",
      });
    }
    if (!data.newPassword && data.newPasswordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPasswordConfirm"],
        message: "Ingresa primero la nueva contrasena",
      });
    }
    if (data.newPassword && data.newPasswordConfirm && data.newPassword !== data.newPasswordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPasswordConfirm"],
        message: "La confirmacion de contrasena no coincide",
      });
    }
  });

export const superAdminAdminConfirmSchema = z.object({
  adminConfirmPassword: z.string().trim().min(1, "Ingresa tu contrasena de confirmacion"),
  statusReason: z.string().trim().max(160, "Maximo 160 caracteres").optional().or(z.literal("")),
});

export type CreateSuperAdminInput = z.infer<typeof createSuperAdminSchema>;
export type UpdateSuperAdminInput = z.infer<typeof updateSuperAdminSchema>;
export type SuperAdminAdminConfirmInput = z.infer<typeof superAdminAdminConfirmSchema>;
