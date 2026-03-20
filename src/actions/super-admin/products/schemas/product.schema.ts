import { z } from "zod";

export const createProductSchema = z.object({
  sku: z.string().min(1, "El SKU es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
  description: z.string().optional(),
  price: z.number().positive("El precio debe ser mayor a 0"),
  weight: z.number().positive().optional(),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  isActive: z.boolean().default(true),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
