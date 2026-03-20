import { z } from "zod";

import { BOLIVIA_PHONE_REGEX } from "@/lib/bolivia";
import { HUMAN_NAME_REGEX } from "@/lib/field-validation";

const phoneSchema = z.string().trim().optional().or(z.literal("")).refine((v) => !v || BOLIVIA_PHONE_REGEX.test(v), "Telefono invalido");

export const updateSystemSchema = z.object({
  currentPassword: z.string().min(1, "Ingresa tu contrasena actual").max(72),
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["es", "en", "pt", "fr"]),
  notifications: z.boolean(),
  timezone: z.string().trim().min(3).max(64),
  dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]),
  timeFormat: z.enum(["12h", "24h"]),
  currency: z.enum(["BOB", "USD", "EUR"]),
  sessionTtlMinutes: z.number().int().min(30).max(1440),
  emergencyPhone: phoneSchema,
  emergencyContactName: z.string().trim().max(80).optional().or(z.literal("")).refine((v) => !v || HUMAN_NAME_REGEX.test(v), "Nombre de contacto invalido"),
  emergencyContactPhone: phoneSchema,
  signatureDisplayName: z.string().trim().max(80).optional().or(z.literal("")),
  signatureTitle: z.string().trim().max(80).optional().or(z.literal("")),
  notificationChannels: z.object({
    login: z.boolean(),
    create: z.boolean(),
    update: z.boolean(),
    delete: z.boolean(),
    security: z.boolean(),
  }),
});

export type UpdateSystemInput = z.infer<typeof updateSystemSchema>;
