import { z } from "zod";
import { PAYMENT_METHODS } from "@/lib/payments";
import { normalizeNationalAddressCode } from "@/lib/utils/address";
import { normalizeSaudiMobile } from "@/lib/utils/phone";

/** Upper bound for the gift message; the active limit comes from the `gift_message_max_length` setting. */
export const GIFT_MESSAGE_HARD_LIMIT = 500;
export const MAX_LINE_QUANTITY = 10;
export const MAX_CART_LINES = 20;

const id = z.number().int().positive();

/** What the cart stores: IDs and choices only, never prices. */
export const cartLineSchema = z.object({
  productId: id,
  variantId: id,
  addOnIds: z.array(id).max(10),
  quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
});
export type CartLineInput = z.infer<typeof cartLineSchema>;

export const cartSchema = z.array(cartLineSchema).min(1).max(MAX_CART_LINES);

const name = z.string().trim().min(2).max(80);
const mobile = z.string().transform((value, ctx) => {
  const normalized = normalizeSaudiMobile(value);
  if (!normalized) ctx.addIssue({ code: "custom", message: "invalid_mobile" });
  return normalized ?? value;
});

/** Step 1: recipient and delivery. */
export const recipientSchema = z.object({
  recipientName: name,
  recipientPhone: mobile,
  cityId: id,
  districtId: id,
  addressLine: z.string().trim().min(5).max(200),
  nationalAddressCode: z
    .string()
    .trim()
    .optional()
    .transform((value, ctx) => {
      if (!value) return undefined;
      const code = normalizeNationalAddressCode(value);
      if (!code)
        ctx.addIssue({ code: "custom", message: "invalid_national_address" });
      return code ?? value;
    }),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotId: id,
});

/** Step 2: gift card. */
export const giftSchema = z.object({
  giftMessage: z.string().trim().max(GIFT_MESSAGE_HARD_LIMIT).optional(),
  hidePrice: z.boolean(),
  anonymousSender: z.boolean(),
  surprise: z.boolean(),
});

/** Step 3: buyer and payment. Card details are deliberately absent. */
export const buyerSchema = z.object({
  buyerName: name,
  buyerPhone: mobile,
  buyerEmail: z.string().trim().toLowerCase().pipe(z.email()),
  paymentMethod: z.enum(PAYMENT_METHODS),
});

export const createOrderSchema = z.object({
  locale: z.enum(["ar", "en"]),
  items: cartSchema,
  recipient: recipientSchema,
  gift: giftSchema,
  buyer: buyerSchema,
  /** Fake reference returned by the mock payment method. */
  paymentReference: z.string().regex(/^MOCK-[A-Z]+-[A-Z0-9]{4,16}$/),
});
export type CreateOrderInput = z.input<typeof createOrderSchema>;
