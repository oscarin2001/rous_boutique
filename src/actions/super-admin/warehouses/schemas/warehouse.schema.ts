import { z } from "zod";

import { ADMIN_VALIDATION_MESSAGES } from "@/lib/admin-validation-messages";
import { BOLIVIA_PHONE_REGEX } from "@/lib/bolivia";
import { BOLIVIA_COUNTRY, BOLIVIA_DEPARTMENTS } from "@/lib/bolivia";
import { PLACE_NAME_REGEX, parseIsoDate } from "@/lib/field-validation";

const dateSchema = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || parseIsoDate(v) !== null, "Fecha invalida")
  .transform((v) => (v ? parseIsoDate(v) : null));

const idList = z.array(z.number().int().positive()).default([]);

export const createWarehouseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Minimo 2 caracteres")
    .max(80, "Maximo 80 caracteres")
    .regex(PLACE_NAME_REGEX, "Solo letras y separadores simples"),
  phone: z
    .string()
    .trim()
    .max(20, "Maximo 20 caracteres")
    .optional()
    .refine((v) => !v || BOLIVIA_PHONE_REGEX.test(v), "Telefono invalido"),
  address: z
    .string()
    .trim()
    .min(5, "Minimo 5 caracteres")
    .max(300, "Maximo 300 caracteres")
    .refine((v) => !/[\n\r]/.test(v), "No se permiten saltos de linea"),
  city: z
    .string()
    .trim()
    .min(2, "Minimo 2 caracteres")
    .max(50, "Maximo 50 caracteres")
    .regex(PLACE_NAME_REGEX, "Solo letras y separadores simples"),
  department: z.enum(BOLIVIA_DEPARTMENTS, {
    message: "Selecciona un departamento valido de Bolivia",
  }),
  country: z.literal(BOLIVIA_COUNTRY),
  openedAt: dateSchema,
  branchIds: idList,
  managerIds: idList,
}).superRefine((data, ctx) => {
  if (!data.branchIds.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["branchIds"],
      message: ADMIN_VALIDATION_MESSAGES.branchRequired,
    });
  }
});

export const updateWarehouseSchema = createWarehouseSchema.extend({
  confirmPassword: z.string().min(1, "La contrasena es obligatoria"),
});
