import { z } from "zod";

import { ADMIN_VALIDATION_MESSAGES } from "@/lib/admin-validation-messages";
import { BOLIVIA_PHONE_REGEX } from "@/lib/bolivia";
import { HUMAN_NAME_REGEX, PLACE_NAME_REGEX, isValidIsoDate } from "@/lib/field-validation";

const dateSchema = z
  .string()
  .trim()
  .refine((val) => val === "" || isValidIsoDate(val), {
    message: "Fecha invalida (YYYY-MM-DD)",
  })
  .optional();

const pastDateSchema = dateSchema.refine((val) => !val || new Date(val) <= new Date(), {
  message: "La fecha no puede ser futura",
});

const birthDateSchema = pastDateSchema;
const partnerSinceSchema = pastDateSchema;
const contractEndAtSchema = dateSchema;

const optionalText = (max: number) => z.string().trim().max(max, `Maximo ${max} caracteres`).optional().or(z.literal(""));

const supplierSchemaBase = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(HUMAN_NAME_REGEX, "Solo letras y separadores simples"),
  lastName: z
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(HUMAN_NAME_REGEX, "Solo letras y separadores simples"),
  phone: z
    .string()
    .trim()
    .refine((val) => !val || BOLIVIA_PHONE_REGEX.test(val), "Debe ser de Bolivia (8 digitos, inicia con 6 o 7)")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Correo electrónico inválido")
    .max(120, "Máximo 120 caracteres")
    .optional()
    .or(z.literal("")),
  address: optionalText(160).refine((val) => !val || !/[\n\r]/.test(val), "No se permiten saltos de linea"),
  city: optionalText(50).refine((val) => !val || PLACE_NAME_REGEX.test(val), "Solo letras y separadores simples"),
  department: optionalText(50).refine((val) => !val || PLACE_NAME_REGEX.test(val), "Solo letras y separadores simples"),
  country: optionalText(50).refine((val) => !val || PLACE_NAME_REGEX.test(val), "Solo letras y separadores simples"),
  ci: z.string().trim().max(20, "Máximo 20 caracteres").regex(/^[A-Za-z0-9-]*$/, "Solo letras, numeros y guion").optional().or(z.literal("")),
  notes: optionalText(500),
  birthDate: birthDateSchema,
  partnerSince: partnerSinceSchema,
  contractEndAt: contractEndAtSchema,
  isIndefinite: z.boolean().default(false),
  isActive: z.boolean().default(true),
  branchIds: z.array(z.number()).default([]),
  managerIds: z.array(z.number()).default([]),
});

function applySupplierCrossValidation(
  data: z.infer<typeof supplierSchemaBase>,
  ctx: z.RefinementCtx
) {
  if (!data.branchIds.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["branchIds"],
      message: ADMIN_VALIDATION_MESSAGES.branchRequired,
    });
  }

  if (data.isIndefinite && data.contractEndAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["contractEndAt"],
      message: "No debe definir fin de contrato cuando es indefinido",
    });
  }

  if (data.partnerSince && data.contractEndAt && data.contractEndAt < data.partnerSince) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["contractEndAt"],
      message: "El fin de contrato no puede ser anterior a Aliado Desde",
    });
  }
}

export const createSupplierSchema = supplierSchemaBase.superRefine(applySupplierCrossValidation);

export const updateSupplierSchema = supplierSchemaBase
  .partial()
  .extend({
    confirmPassword: z.string().trim().min(1, "La contrasena de confirmacion es obligatoria"),
  })
  .superRefine((data, ctx) => {
    if (data.isIndefinite && data.contractEndAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contractEndAt"],
        message: "No debe definir fin de contrato cuando es indefinido",
      });
    }

    if (data.partnerSince && data.contractEndAt && data.contractEndAt < data.partnerSince) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contractEndAt"],
        message: "El fin de contrato no puede ser anterior a Aliado Desde",
      });
    }
  });
