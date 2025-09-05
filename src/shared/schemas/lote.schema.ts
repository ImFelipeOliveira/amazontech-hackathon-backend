import { z } from "zod";
import { LocationSchema, UserSchema } from "./user.schema";

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
  status: true,
  imageUrl: true, // Será gerado após upload
  descriptionAI: true, // Será gerado pela IA
  merchantName: true, // Será preenchido automaticamente
  merchantId: true,
  merchantAddressShort: true, // Será preenchido automaticamente
}).extend({
  user: UserSchema,
  photo: z.instanceof(Buffer).refine((data) => data.length < 5 * 1024 * 1024, { message: "Photo must be less than 5MB" }),
});

export const UpdateLoteSchema = CreateLoteSchema.partial().extend({
  descriptionAI: z.string().min(1).optional(),
});

export const LoteImageUploadSchema = z.object({
  merchantId: z.string().min(1),
  weight: z.number().positive(),
  limit_date: z.iso.datetime(),
  location: LocationSchema,
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

export const CreateLoteMultipartSchema = z.object({
  weight: z.string().regex(/^\d+(\.\d+)?$/, "Weight must be a valid number"),
  limit_date: z.string().datetime("Invalid datetime format"),
  location: z.string().min(1, "Location is required").refine((val) => {
    try {
      const parsed = JSON.parse(val);
      return LocationSchema.safeParse(parsed).success;
    } catch {
      return false;
    }
  }, "Invalid location format"),
});

export const LoteFilterByProximitySchema = z.object({
  latitude: z.coerce.number().min(-90, "Invalid latitude").max(90, "Invalid latitude"),
  longitude: z.coerce.number().min(-180, "Invalid longitude").max(180, "Invalid longitude"),
  radiusKm: z.coerce.number().positive().max(100, "Invalid radiusKm").min(5, "Invalid radiusKm"), // Limite máximo de 100km
});

export type Lote = z.infer<typeof LoteSchema>;
export type CreateLote = z.infer<typeof CreateLoteSchema>;
export type UpdateLote = z.infer<typeof UpdateLoteSchema>;
export type LoteImageUpload = z.infer<typeof LoteImageUploadSchema>;
export type LoteFilter = z.infer<typeof LoteFilterSchema>;
export type LoteFilterByProximity = z.infer<typeof LoteFilterByProximitySchema>
export type CreateLoteMultipart = z.infer<typeof CreateLoteMultipartSchema>;
