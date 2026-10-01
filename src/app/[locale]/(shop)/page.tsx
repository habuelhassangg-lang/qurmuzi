import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandFlood } from "@/components/home/brand-flood";
import { BudgetShortcuts } from "@/components/home/budget-shortcuts";
import { Hero } from "@/components/home/hero";
import { HeroMedia } from "@/components/home/hero-media";
import { OccasionCard } from "@/components/home/occasion-card";
import { Reveal, TextReveal } from "@/components/motion";
import { ProductCard } from "@/components/shop/product-card";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { BUDGET_KEYS } from "@/lib/catalog/filters";
import {
  getSetting,
  listFeaturedProducts,
  listOccasions,
} from "@/lib/db/queries/catalog";
import { JsonLd } from "@/lib/seo/json-ld";
import { organizationJsonLd } from "@/lib/seo/structured-data";
import { alternatesFor } from "@/lib/site";
import { formatHour } from "@/lib/utils/dates";

// Cached after the first visit and refreshed hourly (on-demand ISR).
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return { alternates: alternatesFor(locale) };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [
    t,
    tDelivery,
    tBudgets,
    tCommon,
    tMeta,
    occasions,
    featured,
    cutoffHour,
  ] = await Promise.all([
    getTranslations("Home"),
    getTranslations("Delivery"),
    getTranslations("Budgets"),
    getTranslations("Common"),
    getTranslations("Metadata"),
    listOccasions(locale),
    listFeaturedProducts(locale),
    getSetting("same_day_cutoff_hour", 14),
  ]);

  return (
    <>
      <JsonLd
        data={organizationJsonLd(
          locale,
          tCommon("brand"),
          tMeta("organizationDescription"),
        )}
      />

      <Hero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        body={t("heroBody")}
        promise={tDelivery("promise", { hour: formatHour(cutoffHour, locale) })}
        cta={t("heroCta")}
        media={<HeroMedia alt={t("heroImageAlt")} />}
      />

      <section
        id="occasions"
        aria-labelledby="occasions-title"
        className="scroll-mt-20 bg-surface py-16"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4">
          <div className="flex flex-col gap-2">
            <TextReveal
              as="h2"
              text={t("occasionsTitle")}
              className="font-display text-3xl font-bold md:text-5xl"
            />
            <p className="text-muted-foreground">{t("occasionsBody")}</p>
          </div>
          {/* 🪝 L1 turns this grid into StackCards. */}
          <Reveal>
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {occasions.map((occasion) => (
                <li key={occasion.slug}>
                  <OccasionCard {...occasion} />
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section
        aria-labelledby="budget-title"
        className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16"
      >
        <h2
          id="budget-title"
          className="font-display text-2xl font-bold md:text-3xl"
        >
          {t("budgetTitle")}
        </h2>
        <BudgetShortcuts
          budgets={BUDGET_KEYS.map((key) => ({ key, label: tBudgets(key) }))}
        />
      </section>

      {featured.length > 0 && (
        <section
          aria-labelledby="featured-title"
          className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16"
        >
          <div className="flex items-end justify-between gap-4">
            <h2
              id="featured-title"
              className="font-display text-2xl font-bold md:text-3xl"
            >
              {t("featuredTitle")}
            </h2>
            <Link
              href="/catalog"
              className="inline-flex min-h-11 items-center text-sm font-medium text-crimson-600 hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>
          <Reveal>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
              {featured.map((product) => (
                <li key={product.slug}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      )}

      <BrandFlood
        title={t("floodTitle")}
        body={t("floodBody")}
        cta={t("floodCta")}
      />
    </>
  );
}
