/**
 * `pnpm db:seed` — idempotent.
 * - Catalog, delivery zones, slots and settings are inserted only when the
 *   database has no categories yet.
 * - Daily capacity is topped up every run for the next `capacity_days_ahead`
 *   days (existing rows are left alone), so re-running extends the window.
 */
import { readFileSync } from "node:fs";
import { config } from "dotenv";

config({ path: [".env.local", ".env"], quiet: true });

type Credits = Record<
  string,
  { photographer?: string; photographerUrl?: string; sourceUrl?: string }
>;

async function main() {
  const { db } = await import("../src/lib/db/client");
  const s = await import("../src/lib/db/schema");
  const data = await import("./data/catalog");
  const { addDays, isoWeekday, riyadhDateString } =
    await import("../src/lib/utils/dates");

  const existing = await db
    .select({ id: s.categories.id })
    .from(s.categories)
    .limit(1);

  if (existing.length === 0) {
    const credits = JSON.parse(
      readFileSync("scripts/images/credits.json", "utf8"),
    ) as Credits;

    await db.transaction(async (tx) => {
      const categories = await tx
        .insert(s.categories)
        .values(
          data.CATEGORIES.map((c, i) => ({
            slug: c.slug,
            nameAr: c.ar,
            nameEn: c.en,
            sortOrder: i,
          })),
        )
        .returning({ id: s.categories.id, slug: s.categories.slug });
      const categoryId = new Map(categories.map((c) => [c.slug, c.id]));

      const occasions = await tx
        .insert(s.occasions)
        .values(
          data.OCCASIONS.map((o, i) => ({
            slug: o.slug,
            nameAr: o.ar,
            nameEn: o.en,
            descriptionAr: o.descriptionAr,
            descriptionEn: o.descriptionEn,
            calendar: o.date?.calendar,
            month: o.date?.month,
            day: o.date?.day,
            durationDays: o.date?.durationDays,
            sortOrder: i,
          })),
        )
        .returning({ id: s.occasions.id, slug: s.occasions.slug });
      const occasionId = new Map(occasions.map((o) => [o.slug, o.id]));

      const now = Date.now();
      for (const p of data.PRODUCTS) {
        const [product] = await tx
          .insert(s.products)
          .values({
            slug: p.slug,
            categoryId: categoryId.get(p.category)!,
            nameAr: p.ar,
            nameEn: p.en,
            descriptionAr: p.descriptionAr,
            descriptionEn: p.descriptionEn,
            color: p.color,
            flowerType: p.flowerType,
            createdAt: new Date(now - p.addedDaysAgo * 86_400_000),
          })
          .returning({ id: s.products.id });

        const prices = data.variantPrices(p.price);
        await tx.insert(s.variants).values(
          (["regular", "large", "luxury"] as const).map((size) => ({
            productId: product.id,
            size,
            priceHalalas: prices[size],
          })),
        );
        await tx.insert(s.productOccasions).values(
          p.occasions.map((slug) => ({
            productId: product.id,
            occasionId: occasionId.get(slug)!,
          })),
        );
        await tx.insert(s.productImages).values(
          Array.from({ length: data.IMAGES_PER_PRODUCT }, (_, i) => {
            const name = `${p.slug}-${i + 1}`;
            return {
              productId: product.id,
              path: `/images/products/${name}`,
              altAr: i === 0 ? p.ar : `${p.ar}، صورة ${i + 1}`,
              altEn: i === 0 ? p.en : `${p.en}, photo ${i + 1}`,
              photographer: credits[name]?.photographer,
              photographerUrl: credits[name]?.photographerUrl,
              sourceUrl: credits[name]?.sourceUrl,
              sortOrder: i,
            };
          }),
        );
      }

      await tx.insert(s.addOns).values(
        data.ADD_ONS.map((a, i) => ({
          slug: a.slug,
          nameAr: a.ar,
          nameEn: a.en,
          priceHalalas: a.price * 100,
          sortOrder: i,
        })),
      );

      for (const [i, c] of data.CITIES.entries()) {
        const [city] = await tx
          .insert(s.cities)
          .values({ slug: c.slug, nameAr: c.ar, nameEn: c.en, sortOrder: i })
          .returning({ id: s.cities.id });
        await tx.insert(s.districts).values(
          c.districts.map((d) => ({
            cityId: city.id,
            slug: d.slug,
            nameAr: d.ar,
            nameEn: d.en,
            deliveryFeeHalalas: d.fee * 100,
          })),
        );
      }

      await tx.insert(s.deliverySlots).values(
        data.DELIVERY_SLOTS.map((slot, i) => ({
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          weekdays: slot.weekdays,
          sortOrder: i,
        })),
      );

      await tx
        .insert(s.settings)
        .values(
          Object.entries(data.SETTINGS).map(([key, value]) => ({ key, value })),
        )
        .onConflictDoNothing();
    });
    console.log(
      `Seed: inserted catalog (${data.PRODUCTS.length} products), zones, slots and settings.`,
    );
  } else {
    console.log("Seed: catalog already present, skipping.");
  }

  // Capacity for the next N days. Slots are matched to the seed config by start time.
  const slots = await db.select().from(s.deliverySlots);
  const capacityByStart = new Map(
    data.DELIVERY_SLOTS.map((slot) => [slot.startsAt, slot.capacity]),
  );
  const today = riyadhDateString();
  const rows = [];
  for (let offset = 0; offset < data.SETTINGS.capacity_days_ahead; offset++) {
    const date = addDays(today, offset);
    const weekday = isoWeekday(date);
    for (const slot of slots) {
      if (!slot.weekdays.includes(weekday)) continue;
      rows.push({
        date,
        slotId: slot.id,
        capacity: capacityByStart.get(slot.startsAt.slice(0, 5)) ?? 8,
      });
    }
  }
  const inserted = await db
    .insert(s.dailyCapacity)
    .values(rows)
    .onConflictDoNothing()
    .returning({ date: s.dailyCapacity.date });
  console.log(
    `Seed: ${inserted.length} capacity rows added (${today} + ${data.SETTINGS.capacity_days_ahead} days).`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
