import { z } from "zod";
import {
  buyerSchema,
  giftSchema,
  recipientSchema,
} from "@/lib/validation/checkout";

/** The checkout form: the three steps of `createOrderSchema` (cart and payment reference are added on submit). */
export const checkoutFormSchema = z.object({
  recipient: recipientSchema,
  gift: giftSchema,
  buyer: buyerSchema,
});

export type CheckoutFormInput = z.input<typeof checkoutFormSchema>;
export type CheckoutFormOutput = z.output<typeof checkoutFormSchema>;

export const STEP_FIELDS = ["recipient", "gift", "buyer"] as const;
