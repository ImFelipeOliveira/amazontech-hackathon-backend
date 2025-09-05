// eslint-disable-next-line import/no-named-as-default
import z from "zod";

export const LoginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;
