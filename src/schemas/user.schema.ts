import { z } from "zod";

export const LocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  geohash: z.string().min(1),
});

export const AddressSchema = z.object({
  street: z.string().min(1),
  number: z.string().min(1),
  neighborhood: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1).optional(),
  zip_code: z.string().regex(/^\d{5}-?\d{3}$/),
});

export const ReputationSchema = z.object({
  average_rating: z.number().min(0).max(5),
  total_reviews: z.number().min(0).int(),
});

const BaseUserSchema = z.object({
  uid: z.string().min(1),
  email: z.email(),
  name: z.string().min(1),
  phone_number: z.string().regex(/^\d{10,11}$/),
  role: z.enum(["merchant", "producer"]),
  created_at: z.string().datetime(),
});

export const MerchantSchema = BaseUserSchema.extend({
  role: z.literal("merchant"),
  tax_id: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/), // CNPJ
  legal_name: z.string().min(1),
  address: AddressSchema,
  location: LocationSchema,
});

export const ProducerSchema = BaseUserSchema.extend({
  role: z.literal("producer"),
  collection_capacity_kg: z.number().positive(),
  accepted_waste_types: z.array(z.enum([
    "frutas", "legumes", "folhagens", "outros",
  ])),
  reputation: ReputationSchema,
});

export const UserSchema = z.discriminatedUnion("role", [
  MerchantSchema,
  ProducerSchema,
]);

export const CreateMerchantSchema = MerchantSchema.omit({
  uid: true,
  created_at: true,
});

export const CreateProducerSchema = ProducerSchema.omit({
  uid: true,
  created_at: true,
}).extend({
  reputation: ReputationSchema.optional(),
});

export const UpdateMerchantSchema = CreateMerchantSchema.partial();

export const UpdateProducerSchema = CreateProducerSchema.partial();

export type User = z.infer<typeof UserSchema>;
export type Merchant = z.infer<typeof MerchantSchema>;
export type Producer = z.infer<typeof ProducerSchema>;
export type CreateMerchant = z.infer<typeof CreateMerchantSchema>;
export type CreateProducer = z.infer<typeof CreateProducerSchema>;
export type UpdateMerchant = z.infer<typeof UpdateMerchantSchema>;
export type UpdateProducer = z.infer<typeof UpdateProducerSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type Reputation = z.infer<typeof ReputationSchema>;
