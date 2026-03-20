import { z } from "zod";

import { BOLIVIA_PHONE_REGEX } from "@/lib/bolivia";
import { HUMAN_NAME_REGEX, parseIsoDate } from "@/lib/field-validation";
import { isManagerEmail } from "@/lib/manager-email";

const dateField = z
  .string()
  .trim()
  .min(1, "La fecha de ingreso es obligatoria")
  .refine((value) => parseIsoDate(value) !== null, "Fecha invalida")
  .transform((value) => parseIsoDate(value) as Date);

const birthDateField = z
  .string()
  .trim()
  .min(1, "La fecha de nacimiento es obligatoria")
  .refine((value) => parseIsoDate(value) !== null, "Fecha invalida")
  .transform((value) => parseIsoDate(value) as Date);

function hasMinimumAge(date: Date, years: number): boolean {
  const today = new Date();
  const limitDate = new Date(Date.UTC(today.getUTCFullYear() - years, today.getUTCMonth(), today.getUTCDate()));
  return date <= limitDate;
}

const receivesSalaryField = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "on" || normalized === "yes") return true;
    if (normalized === "false" || normalized === "0" || normalized === "off" || normalized === "no") return false;
  }
  return value;
}, z.boolean());

const managerBaseSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(20, "El nombre no puede exceder 20 caracteres")
    .regex(/^[^\n\r]+$/, "El nombre no puede tener saltos de linea")
    .regex(HUMAN_NAME_REGEX, "El nombre solo permite letras y separadores simples"),
  lastName: z
    .string()
    .trim()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(20, "El apellido no puede exceder 20 caracteres")
    .regex(/^[^\n\r]+$/, "El apellido no puede tener saltos de linea")
    .regex(HUMAN_NAME_REGEX, "El apellido solo permite letras y separadores simples"),
  ci: z
    .string()
    .trim()
    .min(5, "La CI debe tener al menos 5 caracteres")
    .max(20, "La CI no puede exceder 20 caracteres")
    .regex(/^[A-Za-z0-9-]+$/, "La CI solo permite letras, numeros y guion"),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || BOLIVIA_PHONE_REGEX.test(value), "El telefono debe iniciar con 6 o 7 y tener 8 digitos"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(120, "Correo demasiado largo")
    .refine((value) => isManagerEmail(value), "El correo debe usar usuario valido y dominio @rousboutique.com"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña no puede exceder 72 caracteres")
    .regex(/[A-Z]/, "La contraseña debe incluir al menos una mayuscula"),
  passwordConfirm: z
    .string()
    .min(8, "La confirmación debe tener al menos 8 caracteres")
    .max(72, "La confirmación no puede exceder 72 caracteres"),
  receivesSalary: receivesSalaryField,
  salary: z
    .preprocess((value) => {
      if (value === "" || value === null || value === undefined) return 0;
      if (typeof value === "string") return Number(value);
      return value;
    }, z.number().min(0, "El salario no puede ser negativo"))
    .optional(),
  homeAddress: z
    .string()
    .trim()
    .max(160, "La direccion no puede exceder 160 caracteres")
    .optional()
    .or(z.literal("")),
  hireDate: dateField,
  birthDate: birthDateField,
  branchIds: z.array(z.number().int().positive()).optional().default([]),
});

export const createManagerSchema = managerBaseSchema.superRefine((data, ctx) => {
  if (data.password !== data.passwordConfirm) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["passwordConfirm"],
      message: "La confirmación de contraseña no coincide",
    });
  }

  const salary = data.salary ?? 0;
  if (!data.receivesSalary && salary > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["salary"],
      message: "Si no recibe salario, el monto debe ser 0",
    });
  }

  if (data.receivesSalary && salary <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["salary"],
      message: "Si recibe salario, el monto debe ser mayor a 0",
    });
  }

  if (!hasMinimumAge(data.birthDate, 18)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["birthDate"],
      message: "El encargado debe tener al menos 18 anos",
    });
  }
});

export const updateManagerSchema = managerBaseSchema
  .omit({ password: true, passwordConfirm: true })
  .partial()
  .extend({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(72, "La contraseña no puede exceder 72 caracteres")
      .regex(/[A-Z]/, "La contraseña debe incluir al menos una mayuscula")
      .optional()
      .or(z.literal("")),
    passwordConfirm: z.string().trim().optional().or(z.literal("")),
    adminConfirmPassword: z.string().trim().min(1, "La contraseña de confirmacion es obligatoria"),
  })
  .superRefine((data, ctx) => {
    const hasPassword = !!data.password;
    const hasPasswordConfirm = !!data.passwordConfirm;

    if (hasPassword && !hasPasswordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["passwordConfirm"],
        message: "Confirma la nueva contraseña",
      });
      return;
    }

    if (!hasPassword && hasPasswordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["passwordConfirm"],
        message: "Ingresa primero la nueva contraseña",
      });
      return;
    }

    if (hasPassword && hasPasswordConfirm && data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["passwordConfirm"],
        message: "La confirmación de contraseña no coincide",
      });
    }

    if (data.receivesSalary !== undefined && data.salary !== undefined) {
      if (!data.receivesSalary && data.salary > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["salary"],
          message: "Si no recibe salario, el monto debe ser 0",
        });
      }

      if (data.receivesSalary && data.salary <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["salary"],
          message: "Si recibe salario, el monto debe ser mayor a 0",
        });
      }
    }

    if (data.birthDate !== undefined && !hasMinimumAge(data.birthDate, 18)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthDate"],
        message: "El encargado debe tener al menos 18 anos",
      });
    }
  });

export type CreateManagerInput = z.input<typeof createManagerSchema>;
export type UpdateManagerInput = z.input<typeof updateManagerSchema>;
