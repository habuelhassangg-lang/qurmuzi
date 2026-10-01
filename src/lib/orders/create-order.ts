import "server-only";
import { and, eq, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  getAvailability,
  getCheckoutSettings,
  quoteLines,
} from "@/lib/db/queries/checkout";
import {
  dailyCapacity,
  districts,
  orderItems,
  orderStatusHistory,
  orders,
} from "@/lib/db/schema";
import { isSlotBookable } from "@/lib/delivery/availability";
import { emit } from "@/lib/events";
import { calculateTotals } from "@/lib/pricing";
import { riyadhDateString } from "@/lib/utils/dates";
import { createOrderSchema } from "@/lib/validation/checkout";

export type CreateOrderError =
  | "invalid"
  | "cart_changed"
  | "invalid_zone"
  | "slot_unavailable"
  | "gift_message_too_long";

export type CreateOrderResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; error: CreateOrderError };

/** QZ-YYMMDD-XXXXXX, e.g. QZ-261001-7K3M9Q. */
function newOrderNumber(now: Date): string {
  const date = riyadhDateString(now).slice(2).replaceAll("-", "");
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const random = Array.from(
    crypto.getRandomValues(new Uint8Array(6)),
    (b) => alphabet[b % alphabet.length],
  ).join("");
  return `QZ-${date}-${random}`;
}

class SlotFullError extends Error {}

/**
 * Creates a guest order. Everything the client sent is re-validated:
 * prices come from the database, availability is recomputed in Riyadh time,
 * and capacity is reserved atomically inside the same transaction as the order.
 */
export async function createOrder(
  raw: unknown,
  now: Date,
): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { locale, items, recipient, gift, buyer, paymentReference } =
    parsed.data;

  const settings = await getCheckoutSettings();
  if ((gift.giftMessage?.length ?? 0) > settings.giftMessageMaxLength) {
    return { ok: false, error: "gift_message_too_long" };
  }

  // Re-price from the database. Any line that no longer matches means the cart changed.
  const quoted = await quoteLines(items, locale);
  if (quoted.length !== items.length)
    return { ok: false, error: "cart_changed" };

  const [district] = await db
    .select()
    .from(districts)
    .where(
      and(
        eq(districts.id, recipient.districtId),
        eq(districts.cityId, recipient.cityId),
        eq(districts.isActive, true),
      ),
    )
    .limit(1);
  if (!district) return { ok: false, error: "invalid_zone" };

  const availability = await getAvailability(now, settings);
  if (!isSlotBookable(availability, recipient.deliveryDate, recipient.slotId)) {
    return { ok: false, error: "slot_unavailable" };
  }

  const totals = calculateTotals({
    lines: quoted.map((line) => ({
      variantPriceHalalas: line.variantPriceHalalas,
      addOnPricesHalalas: line.addOns.map((a) => a.priceHalalas),
      quantity: line.quantity,
    })),
    deliveryFeeHalalas: district.deliveryFeeHalalas,
  });

  try {
    const order = await db.transaction(async (tx) => {
      // Atomic reservation: only succeeds while reserved < capacity.
      const reserved = await tx
        .update(dailyCapacity)
        .set({ reserved: sql`${dailyCapacity.reserved} + 1` })
        .where(
          and(
            eq(dailyCapacity.date, recipient.deliveryDate),
            eq(dailyCapacity.slotId, recipient.slotId),
            lt(dailyCapacity.reserved, dailyCapacity.capacity),
          ),
        )
        .returning({ reserved: dailyCapacity.reserved });
      if (reserved.length === 0) throw new SlotFullError();

      const [created] = await tx
        .insert(orders)
        .values({
          orderNumber: newOrderNumber(now),
          locale,
          buyerName: buyer.buyerName,
          buyerPhone: buyer.buyerPhone,
          buyerEmail: buyer.buyerEmail,
          recipientName: recipient.recipientName,
          recipientPhone: recipient.recipientPhone,
          cityId: recipient.cityId,
          districtId: recipient.districtId,
          addressLine: recipient.addressLine,
          nationalAddressCode: recipient.nationalAddressCode ?? null,
          deliveryDate: recipient.deliveryDate,
          slotId: recipient.slotId,
          giftMessage: gift.giftMessage || null,
          hidePrice: gift.hidePrice,
          anonymousSender: gift.anonymousSender,
          surprise: gift.surprise,
          paymentMethod: buyer.paymentMethod,
          subtotalHalalas: totals.subtotalHalalas,
          deliveryFeeHalalas: totals.deliveryFeeHalalas,
          discountHalalas: totals.discountHalalas,
          totalHalalas: totals.totalHalalas,
          vatHalalas: totals.vatHalalas,
        })
        .returning({ id: orders.id, orderNumber: orders.orderNumber });

      await tx.insert(orderItems).values(
        quoted.map((line, index) => ({
          orderId: created.id,
          productId: line.productId,
          variantId: line.variantId,
          quantity: line.quantity,
          unitPriceHalalas: totals.lines[index].unitHalalas,
          snapshot: {
            slug: line.slug,
            name: line.name,
            size: line.size,
            image: line.image,
            addOns: line.addOns,
          },
        })),
      );
      await tx.insert(orderStatusHistory).values({
        orderId: created.id,
        status: "confirmed",
        note: `payment ${buyer.paymentMethod} ${paymentReference}`,
      });
      return created;
    });

    await emit("orderCreated", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      locale,
      buyerEmail: buyer.buyerEmail,
    });
    return { ok: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (error) {
    if (error instanceof SlotFullError)
      return { ok: false, error: "slot_unavailable" };
    throw error;
  }
}
