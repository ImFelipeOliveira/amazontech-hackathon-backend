import { z } from "zod";

export const AvaliacaoSchema = z.object({
  id: z.string().min(1),
  agendamentoId: z.string().min(1),
  producerId: z.string().min(1),
  merchantId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(500),
  created_at: z.iso.datetime(),
});

export const CreateAvaliacaoSchema = AvaliacaoSchema.omit({
  id: true,
  created_at: true,
});

export const UpdateAvaliacaoSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(1).max(500).optional(),
});

export const AvaliacaoFilterSchema = z
  .object({
    producerId: z.string().min(1).optional(),
    merchantId: z.string().min(1).optional(),
    agendamentoId: z.string().min(1).optional(),
    minRating: z.number().int().min(1).max(5).optional(),
    maxRating: z.number().int().min(1).max(5).optional(),
    startDate: z.iso.datetime().optional(),
    endDate: z.iso.datetime().optional(),
  })
  .refine((data) => {
    if (data.minRating && data.maxRating && data.minRating > data.maxRating) {
      return false;
    }
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  }, {
    message: "Invalid filter range",
    path: ["minRating"],
  });

export type Avaliacao = z.infer<typeof AvaliacaoSchema>;
export type CreateAvaliacao = z.infer<typeof CreateAvaliacaoSchema>;
export type UpdateAvaliacao = z.infer<typeof UpdateAvaliacaoSchema>;
export type AvaliacaoFilter = z.infer<typeof AvaliacaoFilterSchema>;

