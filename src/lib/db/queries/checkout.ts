import "server-only";
import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";
import type { Locale } from "@/i18n/routing";
import {
  computeAvailability,
  type DayAvailability,
} from "@/lib/delivery/availability";
import { addDays, riyadhDateString } from "@/lib/utils/dates";
import type { CartLineInput } from "@/lib/validation/checkout";
import { db } from "../client";
import {
  addOns,
  blackoutDates,
  cities,
  dailyCapacity,
  deliverySlots,
  districts,
  productImages,
  products,
  variants,
} from "../schema";
import { getSetting } from "./catalog";

export type CheckoutSettings = {
  cutoffHour: number;
  prepHours: number;
  daysAhead: number;
  giftMessageMaxLength: number;
};

export async function getCheckoutSettings(): Promise<CheckoutSettings> {
  const [cutoffHour, prepHours, daysAhead, giftMessageMaxLength] =
    await Promise.all([
      getSetting("same_day_cutoff_hour", 14),
      getSetting("same_day_prep_hours", 2),
      getSetting("delivery_days_ahead", 14),
      getSetting("gift_message_max_length", 200),
    ]);
  return { cutoffHour, prepHours, daysAhead, giftMessageMaxLength };
}

export type CityOption = {
  id: number;
  name: string;
  districts: Array<{ id: number; name: string; deliveryFeeHalalas: number }>;
};

export async function listDeliveryZones(locale: Locale): Promise<CityOption[]> {
  const [cityRows, districtRows] = await Promise.all([
    db
      .select()
      .from(cities)
      .where(eq(cities.isActive, true))
      .orderBy(asc(cities.sortOrder)),
    db
      .select()
      .from(districts)
      .where(eq(districts.isActive, true))
      .orderBy(asc(districts.id)),
  ]);
  return cityRows.map((city) => ({
    id: city.id,
    name: locale === "ar" ? city.nameAr : city.nameEn,
    districts: districtRows
      .filter((d) => d.cityId === city.id)
      .map((d) => ({
        id: d.id,
        name: locale === "ar" ? d.nameAr : d.nameEn,
        deliveryFeeHalalas: d.deliveryFeeHalalas,
      })),
  }));
}

/** Delivery availability for the next `daysAhead` days, computed on the server. */
export async function getAvailability(
  now: Date,
  settings: CheckoutSettings,
): Promise<DayAvailability[]> {
  const first = riyadhDateString(now);
  const last = addDays(first, settings.daysAhead - 1);
  const [slots, capacity, blackout] = await Promise.all([
    db
      .select()
      .from(deliverySlots)
      .where(eq(deliverySlots.isActive, true))
      .orderBy(asc(deliverySlots.sortOrder)),
    db
      .select()
      .from(dailyCapacity)
      .where(
        and(gte(dailyCapacity.date, first), lte(dailyCapacity.date, last)),
      ),
    db
      .select({ date: blackoutDates.date })
      .from(blackoutDates)
      .where(
        and(gte(blackoutDates.date, first), lte(blackoutDates.date, last)),
      ),
  ]);
  return computeAvailability({
    now,
    cutoffHour: settings.cutoffHour,
    prepHours: settings.prepHours,
    daysAhead: settings.daysAhead,
    slots,
    capacity,
    blackoutDates: blackout.map((row) => row.date),
  });
}

export type QuotedLine = CartLineInput & {
  slug: string;
  name: string;
  size: "regular" | "large" | "luxury";
  image: string | null;
  variantPriceHalalas: number;
  addOns: Array<{ id: number; name: string; priceHalalas: number }>;
};

/**
 * Prices cart lines from the database. Lines whose product, size or add-ons
 * no longer exist (or don't belong together) are dropped, never trusted.
 */
export async function quoteLines(
  items: readonly CartLineInput[],
  locale: Locale,
): Promise<QuotedLine[]> {
  if (items.length === 0) return [];
  const variantIds = [...new Set(items.map((i) => i.variantId))];
  const addOnIds = [...new Set(items.flatMap((i) => i.addOnIds))];

  const [variantRows, addOnRows] = await Promise.all([
    db
      .select({
        variantId: variants.id,
        productId: variants.productId,
        size: variants.size,
        priceHalalas: variants.priceHalalas,
        slug: products.slug,
        nameAr: products.nameAr,
        nameEn: products.nameEn,
      })
      .from(variants)
      .innerJoin(products, eq(products.id, variants.productId))
      .where(
        and(inArray(variants.id, variantIds), eq(products.isActive, true)),
      ),
    addOnIds.length
      ? db
          .select()
          .from(addOns)
          .where(and(inArray(addOns.id, addOnIds), eq(addOns.isActive, true)))
      : Promise.resolve([]),
  ]);
  const productIds = [...new Set(variantRows.map((v) => v.productId))];
  const images = productIds.length
    ? await db
        .selectDistinctOn([productImages.productId], {
          productId: productImages.productId,
          path: productImages.path,
        })
        .from(productImages)
        .where(inArray(productImages.productId, productIds))
        .orderBy(productImages.productId, asc(productImages.sortOrder))
    : [];

  const variantById = new Map(variantRows.map((v) => [v.variantId, v]));
  const addOnById = new Map(addOnRows.map((a) => [a.id, a]));
  const imageByProduct = new Map(images.map((i) => [i.productId, i.path]));

  return items.flatMap((item) => {
    const variant = variantById.get(item.variantId);
    if (!variant || variant.productId !== item.productId) return [];
    const lineAddOns = item.addOnIds.map((id) => addOnById.get(id));
    if (lineAddOns.some((a) => !a)) return [];
    return [
      {
        ...item,
        slug: variant.slug,
        name: locale === "ar" ? variant.nameAr : variant.nameEn,
        size: variant.size,
        image: imageByProduct.get(variant.productId) ?? null,
        variantPriceHalalas: variant.priceHalalas,
        addOns: lineAddOns.map((a) => ({
          id: a!.id,
          name: locale === "ar" ? a!.nameAr : a!.nameEn,
          priceHalalas: a!.priceHalalas,
        })),
      },
    ];
  });
}
