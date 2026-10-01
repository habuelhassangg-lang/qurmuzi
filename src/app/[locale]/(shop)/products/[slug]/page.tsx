import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductPurchase } from "@/components/shop/product-purchase";
import { ViewItemTracker } from "@/components/shop/view-item-tracker";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { IMAGE_LARGE_WIDTH } from "@/lib/catalog/images";
import { getProduct, getSetting } from "@/lib/db/queries/catalog";
import { JsonLd } from "@/lib/seo/json-ld";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/structured-data";
import { absoluteUrl, alternatesFor, localePath } from "@/lib/site";
import { formatHour } from "@/lib/utils/dates";

// Rendered on first visit, then cached and refreshed hourly (ISR). The build
// never touches the database, so it works with PGlite locally and in CI.
export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/products/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const product = await getProduct(slug, locale);
  if (!product) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const image = product.images[0];
  return {
    title: product.name,
    description: `${product.description} ${t("productDescriptionSuffix")}`,
    alternates: alternatesFor(locale, `/products/${slug}`),
    openGraph: image
      ? {
          images: [
            {
              url: absoluteUrl(`${image.path}-${IMAGE_LARGE_WIDTH}.webp`),
              width: 960,
              height: 1200,
            },
          ],
        }
      : undefined,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/[locale]/products/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const product = await getProduct(slug, locale);
  if (!product) notFound();

  const [t, tDelivery, tCatalog, tCommon, tHeader, cutoffHour] =
    await Promise.all([
      getTranslations("Product"),
      getTranslations("Delivery"),
      getTranslations("Catalog"),
      getTranslations("Common"),
      getTranslations("Header"),
      getSetting("same_day_cutoff_hour", 14),
    ]);

  const breadcrumbs = [
    { name: tHeader("home"), path: localePath(locale, "") },
    { name: tCatalog("title"), path: localePath(locale, "/catalog") },
    {
      name: product.name,
      path: localePath(locale, `/products/${product.slug}`),
    },
  ];
  const credit = product.images.find((image) => image.photographer);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-32 md:pb-6">
      <JsonLd data={productJsonLd(product, locale, tCommon("brand"))} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <ViewItemTracker
        item_id={product.slug}
        item_name={product.name}
        value={product.variants[0].priceHalalas / 100}
        currency="SAR"
      />

      <nav
        aria-label={t("breadcrumb")}
        className="mb-4 text-sm text-muted-foreground"
      >
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-foreground">
              {breadcrumbs[0].name}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/catalog" className="hover:text-foreground">
              {breadcrumbs[1].name}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <ProductGallery
            images={product.images.map(({ path, alt }) => ({ path, alt }))}
            transitionName={`product-${product.slug}`}
          />
          <p className="text-xs text-muted-foreground">
            {credit
              ? t("photoBy", { name: credit.photographer ?? "" })
              : t("placeholderImage")}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.description}</p>
            {product.occasions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm">{t("occasions")}:</span>
                {product.occasions.map((occasion) => (
                  <Badge key={occasion.slug} variant="secondary" asChild>
                    <Link
                      href={{
                        pathname: "/catalog",
                        query: { occasion: occasion.slug },
                      }}
                    >
                      {occasion.name}
                    </Link>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <p className="flex items-center gap-2 rounded-xl bg-crimson-50 px-4 py-3 text-sm font-medium text-crimson-700">
            <Truck className="size-5 shrink-0 rtl:-scale-x-100" aria-hidden />
            {tDelivery("promise", { hour: formatHour(cutoffHour, locale) })}
          </p>

          <ProductPurchase
            variants={product.variants}
            addOns={product.addOns}
          />

          <p className="border-t pt-4 text-sm text-muted-foreground">
            {tDelivery("substitution")}
          </p>
        </div>
      </div>
    </div>
  );
}
