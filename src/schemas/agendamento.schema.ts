import { z } from "zod";

export const CollectionDataSchema = z.object({
  full_address: z.string().min(1),
  company_name: z.string().min(1),
  phone: z.string().regex(/^\d{10,11}$/),
});

export const AgendamentoSchema = z.object({
  id: z.string().min(1),
  loteId: z.string().min(1),
  producerId: z.string().min(1),
  merchantId: z.string().min(1),
  status: z.enum([
    "aguardando_confirmacao",
    "confirmado",
    "rejeitado",
    "finalizado",
  ]),
  scheduled_date: z.string().datetime(),
  created_at: z.string().datetime(),
  collectionData: CollectionDataSchema.nullable(),

  producerName: z.string().min(1),
  loteImageUrl: z.url(),
  merchantName: z.string().min(1),
});

export const CreateAgendamentoSchema = AgendamentoSchema.omit({
  id: true,
  created_at: true,
  status: true,
  collectionData: true,
  producerName: true,
  loteImageUrl: true,
  merchantName: true,
});

export const ConfirmAgendamentoSchema = z.object({
  agendamentoId: z.string().min(1),
  collectionData: CollectionDataSchema,
});

export const RejectAgendamentoSchema = z.object({
  agendamentoId: z.string().min(1),
  reason: z.string().min(1).optional(),
});

export const FinalizeAgendamentoSchema = z.object({
  agendamentoId: z.string().min(1),
});

export const UpdateAgendamentoSchema = z.object({
  scheduled_date: z.iso.datetime().optional(),
  status: z.enum([
    "aguardando_confirmacao",
    "confirmado",
    "rejeitado",
    "finalizado",
  ]).optional(),
  collectionData: CollectionDataSchema.optional(),
});

export type Agendamento = z.infer<typeof AgendamentoSchema>;
export type CreateAgendamento = z.infer<typeof CreateAgendamentoSchema>;
export type ConfirmAgendamento = z.infer<typeof ConfirmAgendamentoSchema>;
export type RejectAgendamento = z.infer<typeof RejectAgendamentoSchema>;
export type FinalizeAgendamento = z.infer<typeof FinalizeAgendamentoSchema>;
export type UpdateAgendamento = z.infer<typeof UpdateAgendamentoSchema>;
export type CollectionData = z.infer<typeof CollectionDataSchema>;
