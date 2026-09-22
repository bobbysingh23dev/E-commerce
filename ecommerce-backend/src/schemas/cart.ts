import { z } from "zod";

// ONE definition per input — drives validation AND the TypeScript type.
export const addCartItemSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export const quantitySchema = z.object({
  quantity: z.number().int().positive(),
});

// Types inferred straight from the schemas — no separate interface to maintain.
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type QuantityInput = z.infer<typeof quantitySchema>;
