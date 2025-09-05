import { z } from "zod";
import { LocationSchema } from "./user.schema";

export const LoteSchema = z.object({
  id: z.string().min(1),
  merchantId: z.string().min(1),
  status: z.enum(["ativo", "confirmado", "finalizado"]),
  weight: z.number().positive(),
  imageUrl: z.url(),
  descriptionAI: z.string().min(1),
  limit_date: z.iso.datetime(),
  created_at: z.iso.datetime(),
  location: LocationSchema,
  merchantName: z.string().min(1),
  merchantAddressShort: z.string().min(1),
});

export const CreateLoteSchema = LoteSchema.omit({
  id: true,
  created_at: true,
  descriptionAI: true, // Será gerado pela IA
  merchantName: true, // Será preenchido automaticamente
  merchantAddressShort: true, // Será preenchido automaticamente
});

export const UpdateLoteSchema = CreateLoteSchema.partial().extend({
  descriptionAI: z.string().min(1).optional(),
});

export const LoteImageUploadSchema = z.object({
  merchantId: z.string().min(1),
  weight: z.number().positive(),
  limit_date: z.iso.datetime(),
  location: LocationSchema,
  image: z.any(), // File/Buffer - tipo específico depende da implementação
});

export const LoteFilterSchema = z.object({
  location: LocationSchema.optional(),
  maxDistance: z.number().positive().optional(), // em km
  wasteTypes: z.array(z.enum([
    "frutas", "legumes", "folhagens", "outros",
  ])).optional(),
  minWeight: z.number().positive().optional(),
  maxWeight: z.number().positive().optional(),
  status: z.enum(["ativo", "confirmado", "finalizado"]).optional(),
}).refine((data) => {
  if (data.maxDistance && !data.location) {
    return false;
  }
  return true;
}, {
  message: "Location is required when maxDistance is provided",
  path: ["location"],
});

export type Lote = z.infer<typeof LoteSchema>;
export type CreateLote = z.infer<typeof CreateLoteSchema>;
export type UpdateLote = z.infer<typeof UpdateLoteSchema>;
export type LoteImageUpload = z.infer<typeof LoteImageUploadSchema>;
export type LoteFilter = z.infer<typeof LoteFilterSchema>;
