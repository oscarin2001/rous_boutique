import { z } from "zod";

export const securitySectionSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(60, "El usuario no puede exceder 60 caracteres")
    .regex(/^[a-z0-9._@-]+$/, "Usuario invalido"),
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
  currentPassword: z.string().min(1, "Ingresa tu contrasena actual").max(72),
}).superRefine((data, ctx) => {
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

export type SecuritySectionSchemaInput = z.infer<typeof securitySectionSchema>;
