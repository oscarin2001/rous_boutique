import { z } from "zod";

import {
  BOLIVIA_COUNTRY,
  BOLIVIA_DEPARTMENTS,
  BOLIVIA_PHONE_REGEX,
} from "@/lib/bolivia";
import { PLACE_NAME_REGEX, parseIsoDate } from "@/lib/field-validation";

export const createBranchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .regex(/^[^\n\r]+$/, "El nombre no puede tener saltos de linea")
    .regex(PLACE_NAME_REGEX, "El nombre solo permite letras y separadores simples"),
  nit: z
    .string()
    .trim()
    .max(20, "El NIT no puede exceder 20 caracteres")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(BOLIVIA_PHONE_REGEX, "El telefono debe iniciar con 6 o 7 y tener 8 digitos"),
  address: z
    .string()
    .trim()
    .min(3, "La dirección debe tener al menos 3 caracteres")
    .max(120, "La dirección no puede exceder 120 caracteres")
    .regex(/^[^\n\r]+$/, "La direccion no puede tener saltos de linea"),
  city: z
    .string()
    .trim()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(50, "La ciudad no puede exceder 50 caracteres")
    .regex(/^[^\n\r]+$/, "La ciudad no puede tener saltos de linea")
    .regex(PLACE_NAME_REGEX, "La ciudad solo permite letras y separadores simples"),
  department: z.enum(BOLIVIA_DEPARTMENTS, {
    message: "Selecciona un departamento valido de Bolivia",
  }),
  country: z.literal(BOLIVIA_COUNTRY).default(BOLIVIA_COUNTRY),
  googleMaps: z
    .string()
    .trim()
    .max(300, "El enlace de Google Maps no puede exceder 300 caracteres")
    .refine(
      (value) =>
        !value ||
        /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.[a-z.]+\/maps|maps\.google\.[a-z.]+)/i.test(value),
      "Ingresa un enlace valido de Google Maps"
    )
    .optional()
    .or(z.literal("")),
  managerId: z
    .preprocess((value) => {
      if (value === "" || value === null || value === undefined) return null;
      if (typeof value === "string") return Number(value);
      return value;
    }, z.number().int().positive().nullable())
    .optional(),
  openedAt: z
    .string()
    .trim()
    .min(1, "La fecha de apertura es obligatoria")
    .refine((value) => parseIsoDate(value) !== null, "Fecha de apertura invalida")
    .transform((value) => (value ? parseIsoDate(value) : null)),
});

export const updateBranchSchema = createBranchSchema.partial();

export type CreateBranchInput = z.input<typeof createBranchSchema>;
export type UpdateBranchInput = z.input<typeof updateBranchSchema>;
