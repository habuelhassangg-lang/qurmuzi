import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductCard } from "@/components/shop/product-card";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { BUDGET_KEYS, SORTS } from "@/lib/catalog/filters";
import { listOccasions, listProducts } from "@/lib/db/queries/catalog";
import { alternatesFor } from "@/lib/site";
import { formatNumber } from "@/lib/utils/numbers";
import { catalogQuery, parseCatalogFilters } from "@/lib/validation/catalog";
import { FilterChips, type Chip } from "./filter-chips";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/catalog">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("catalogTitle"),
    description: t("catalogDescription"),
    // Filtered views share the unfiltered canonical.
    alternates: alternatesFor(locale, "/catalog"),
  };
}

export default async function CatalogPage({
  params,
  searchParams,
}: PageProps<"/[locale]/catalog">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const filters = parseCatalogFilters(await searchParams);
  const [t, tBudgets, tSorts, products, occasions] = await Promise.all([
    getTranslations("Catalog"),
    getTranslations("Budgets"),
    getTranslations("Sorts"),
    listProducts(filters, locale),
    listOccasions(locale),
  ]);

  const occasionChips: Chip[] = [
    {
      key: "all",
      label: t("all"),
      query: catalogQuery({ ...filters, occasion: undefined }),
      active: !filters.occasion,
    },
    ...occasions.map((o) => ({
      key: o.slug,
      label: o.name,
      query: catalogQuery({ ...filters, occasion: o.slug }),
      active: filters.occasion === o.slug,
    })),
  ];
  const budgetChips: Chip[] = [
    {
      key: "all",
      label: t("all"),
      query: catalogQuery({ ...filters, budget: undefined }),
      active: !filters.budget,
    },
    ...BUDGET_KEYS.map((key) => ({
      key,
      label: tBudgets(key),
      query: catalogQuery({ ...filters, budget: key }),
      active: filters.budget === key,
    })),
  ];
  const sortChips: Chip[] = SORTS.map((key) => ({
    key,
    label: tSorts(key),
    query: catalogQuery({ ...filters, sort: key }),
    active: filters.sort === key,
  }));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <h1 className="font-display text-3xl font-bold">{t("title")}</h1>

      <section aria-label={t("filters")} className="flex flex-col gap-4">
        <FilterChips label={t("occasion")} chips={occasionChips} />
        <FilterChips label={t("budget")} chips={budgetChips} />
        <FilterChips label={t("sort")} chips={sortChips} />
      </section>

      <p role="status" className="text-sm text-muted-foreground">
        {t("results", {
          count: products.length,
          formatted: formatNumber(products.length, locale),
        })}
      </p>

      {products.length > 0 ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <li key={product.slug}>
              <ProductCard product={product} priority={index < 2} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-16 text-center">
          <p className="font-display text-xl font-semibold">
            {t("emptyTitle")}
          </p>
          <p className="text-muted-foreground">{t("emptyBody")}</p>
          <Link
            href="/catalog"
            className="mt-2 inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-crimson-500"
          >
            {t("clearFilters")}
          </Link>
        </div>
      )}
    </div>
  );
}
