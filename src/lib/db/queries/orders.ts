import "server-only";
import { asc, eq } from "drizzle-orm";
import type { Locale } from "@/i18n/routing";
import { db } from "../client";
import {
  cities,
  deliverySlots,
  districts,
  orderItems,
  orders,
} from "../schema";
import { getSetting } from "./catalog";

type ItemSnapshot = {
  name: string;
  size: "regular" | "large" | "luxury";
  addOns: Array<{ name: string }>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Everything the confirmation page and invoice need. The random UUID is the only key. */
export async function getOrderForInvoice(id: string, locale: Locale) {
  if (!UUID.test(id)) return null;
  const [row] = await db
    .select({
      order: orders,
      cityAr: cities.nameAr,
      cityEn: cities.nameEn,
      districtAr: districts.nameAr,
      districtEn: districts.nameEn,
      slotStartsAt: deliverySlots.startsAt,
      slotEndsAt: deliverySlots.endsAt,
    })
    .from(orders)
    .innerJoin(cities, eq(cities.id, orders.cityId))
    .innerJoin(districts, eq(districts.id, orders.districtId))
    .innerJoin(deliverySlots, eq(deliverySlots.id, orders.slotId))
    .where(eq(orders.id, id))
    .limit(1);
  if (!row) return null;

  const [items, vatNumber, sellerName] = await Promise.all([
    db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id))
      .orderBy(asc(orderItems.id)),
    getSetting("vat_number", "300000000000003"),
    getSetting(
      locale === "ar" ? "seller_name_ar" : "seller_name_en",
      "Qurmuzi",
    ),
  ]);

  return {
    ...row.order,
    city: locale === "ar" ? row.cityAr : row.cityEn,
    district: locale === "ar" ? row.districtAr : row.districtEn,
    slot: { startsAt: row.slotStartsAt, endsAt: row.slotEndsAt },
    vatNumber,
    sellerName,
    items: items.map((item) => {
      const snapshot = item.snapshot as ItemSnapshot;
      return {
        id: item.id,
        name: snapshot.name,
        size: snapshot.size,
        addOns: snapshot.addOns.map((a) => a.name),
        quantity: item.quantity,
        unitPriceHalalas: item.unitPriceHalalas,
      };
    }),
  };
}
