import { and, asc, desc, eq, exists, gte, lt, min, sql } from "drizzle-orm";
import type { Locale } from "@/i18n/routing";
import { BUDGETS, type SortKey } from "@/lib/catalog/filters";
import type { CatalogFilters } from "@/lib/validation/catalog";
import { db } from "../client";
import {
  addOns,
  categories,
  occasions,
  productImages,
  productOccasions,
  products,
  settings,
  variants,
} from "../schema";

const SIZE_ORDER = { regular: 0, large: 1, luxury: 2 } as const;

const localized = <T extends { nameAr: string; nameEn: string }>(
  row: T,
  locale: Locale,
) => (locale === "ar" ? row.nameAr : row.nameEn);

export type ProductCardData = {
  slug: string;
  name: string;
  fromPriceHalalas: number;
  image: { path: string; alt: string } | null;
};

/** Products for the catalog grid, filtered and sorted in SQL. Price filters use the cheapest size. */
export async function listProducts(
  filters: CatalogFilters,
  locale: Locale,
): Promise<ProductCardData[]> {
  const fromPrice = min(variants.priceHalalas).mapWith(Number);
  const budget = filters.budget ? BUDGETS[filters.budget] : null;

  const conditions = [eq(products.isActive, true)];
  if (filters.occasion) {
    conditions.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(productOccasions)
          .innerJoin(occasions, eq(occasions.id, productOccasions.occasionId))
          .where(
            and(
              eq(productOccasions.productId, products.id),
              eq(occasions.slug, filters.occasion),
            ),
          ),
      ),
    );
  }

  const orderBy: Record<SortKey, ReturnType<typeof asc>[]> = {
    newest: [desc(products.createdAt), asc(products.id)],
    "price-asc": [asc(fromPrice), asc(products.id)],
    "price-desc": [desc(fromPrice), asc(products.id)],
  };

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      nameAr: products.nameAr,
      nameEn: products.nameEn,
      fromPrice,
    })
    .from(products)
    .innerJoin(variants, eq(variants.productId, products.id))
    .where(and(...conditions))
    .groupBy(products.id)
    .having(
      budget
        ? and(
            gte(fromPrice, budget.min),
            budget.max === null ? undefined : lt(fromPrice, budget.max),
          )
        : undefined,
    )
    .orderBy(...orderBy[filters.sort]);

  if (rows.length === 0) return [];

  const images = await db
    .selectDistinctOn([productImages.productId], {
      productId: productImages.productId,
      path: productImages.path,
      altAr: productImages.altAr,
      altEn: productImages.altEn,
    })
    .from(productImages)
    .orderBy(productImages.productId, asc(productImages.sortOrder));
  const imageByProduct = new Map(
    images.map((image) => [image.productId, image]),
  );

  return rows.map((row) => {
    const image = imageByProduct.get(row.id);
    return {
      slug: row.slug,
      name: localized(row, locale),
      fromPriceHalalas: row.fromPrice,
      image: image
        ? { path: image.path, alt: locale === "ar" ? image.altAr : image.altEn }
        : null,
    };
  });
}

export type OccasionOption = { slug: string; name: string };
export type OccasionSummary = OccasionOption & { description: string | null };

export async function listOccasions(
  locale: Locale,
): Promise<OccasionSummary[]> {
  const rows = await db
    .select({
      slug: occasions.slug,
      nameAr: occasions.nameAr,
      nameEn: occasions.nameEn,
      descriptionAr: occasions.descriptionAr,
      descriptionEn: occasions.descriptionEn,
    })
    .from(occasions)
    .orderBy(asc(occasions.sortOrder));
  return rows.map((row) => ({
    slug: row.slug,
    name: localized(row, locale),
    description: locale === "ar" ? row.descriptionAr : row.descriptionEn,
  }));
}

/**
 * Featured products, in the order set by the `featured_products` setting.
 * The catalog is small (15 products in the MVP), so this reuses `listProducts`.
 */
export async function listFeaturedProducts(
  locale: Locale,
): Promise<ProductCardData[]> {
  const slugs = await getSetting<string[]>("featured_products", []);
  if (slugs.length === 0) return [];
  const all = await listProducts(
    { sort: "newest", occasion: undefined, budget: undefined },
    locale,
  );
  const bySlug = new Map(all.map((product) => [product.slug, product]));
  return slugs.flatMap((slug) => bySlug.get(slug) ?? []);
}

export async function listProductSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.id));
  return rows.map((row) => row.slug);
}

export type ProductDetail = {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: { slug: string; name: string };
  occasions: OccasionOption[];
  variants: Array<{
    id: number;
    size: keyof typeof SIZE_ORDER;
    priceHalalas: number;
  }>;
  images: Array<{
    path: string;
    alt: string;
    photographer: string | null;
    photographerUrl: string | null;
  }>;
  addOns: Array<{
    id: number;
    slug: string;
    name: string;
    priceHalalas: number;
  }>;
};

export async function getProduct(
  slug: string,
  locale: Locale,
): Promise<ProductDetail | null> {
  const [row] = await db
    .select({
      id: products.id,
      slug: products.slug,
      nameAr: products.nameAr,
      nameEn: products.nameEn,
      descriptionAr: products.descriptionAr,
      descriptionEn: products.descriptionEn,
      categorySlug: categories.slug,
      categoryAr: categories.nameAr,
      categoryEn: categories.nameEn,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);
  if (!row) return null;

  const [variantRows, imageRows, occasionRows, addOnRows] = await Promise.all([
    db.select().from(variants).where(eq(variants.productId, row.id)),
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, row.id))
      .orderBy(asc(productImages.sortOrder)),
    db
      .select({
        slug: occasions.slug,
        nameAr: occasions.nameAr,
        nameEn: occasions.nameEn,
      })
      .from(productOccasions)
      .innerJoin(occasions, eq(occasions.id, productOccasions.occasionId))
      .where(eq(productOccasions.productId, row.id))
      .orderBy(asc(occasions.sortOrder)),
    db
      .select()
      .from(addOns)
      .where(eq(addOns.isActive, true))
      .orderBy(asc(addOns.sortOrder)),
  ]);

  return {
    id: row.id,
    slug: row.slug,
    name: localized(row, locale),
    description: locale === "ar" ? row.descriptionAr : row.descriptionEn,
    category: {
      slug: row.categorySlug,
      name: locale === "ar" ? row.categoryAr : row.categoryEn,
    },
    occasions: occasionRows.map((o) => ({
      slug: o.slug,
      name: localized(o, locale),
    })),
    variants: variantRows
      .map((v) => ({ id: v.id, size: v.size, priceHalalas: v.priceHalalas }))
      .sort((a, b) => SIZE_ORDER[a.size] - SIZE_ORDER[b.size]),
    images: imageRows.map((image) => ({
      path: image.path,
      alt: locale === "ar" ? image.altAr : image.altEn,
      photographer: image.photographer,
      photographerUrl: image.photographerUrl,
    })),
    addOns: addOnRows.map((a) => ({
      id: a.id,
      slug: a.slug,
      name: localized(a, locale),
      priceHalalas: a.priceHalalas,
    })),
  };
}

/** Reads one operational setting from the `settings` table. */
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const [row] = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);
  return (row?.value as T | undefined) ?? fallback;
}
