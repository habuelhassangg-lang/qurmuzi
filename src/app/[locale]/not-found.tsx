import { getLocale, getTranslations } from "next-intl/server";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { listFeaturedProducts, listOccasions } from "@/lib/db/queries/catalog";

const SUGGESTED_OCCASIONS = ["love", "birthday", "new-baby", "get-well"];

/** Friendly 404 with ways back into the shop. */
export default async function NotFound() {
  const requested = await getLocale();
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const t = await getTranslations("NotFound");
  // Suggestions are a bonus: if the database is unavailable, the page still renders.
  const [occasions, featured] = await Promise.all([
    listOccasions(locale).catch(() => []),
    listFeaturedProducts(locale).catch(() => []),
  ]);
  const suggested = occasions.filter((o) =>
    SUGGESTED_OCCASIONS.includes(o.slug),
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-16">
      <title>{t("metaTitle")}</title>
      <meta name="robots" content="noindex" />
      <div className="flex flex-col items-center gap-4 text-center">
        <p
          className="font-logo text-6xl font-bold text-crimson-600"
          aria-hidden
        >
          404
        </p>
        <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
        <p className="max-w-prose text-muted-foreground">{t("body")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/catalog">{t("catalog")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">{t("home")}</Link>
          </Button>
        </div>
      </div>

      {suggested.length > 0 && (
        <section aria-labelledby="nf-occasions" className="flex flex-col gap-3">
          <h2 id="nf-occasions" className="font-display text-xl font-semibold">
            {t("occasions")}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {suggested.map((occasion) => (
              <li key={occasion.slug}>
                <Link
                  href={{
                    pathname: "/catalog",
                    query: { occasion: occasion.slug },
                  }}
                  className="inline-flex min-h-11 items-center rounded-full border bg-surface px-4 text-sm hover:border-crimson-600"
                >
                  {occasion.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {featured.length > 0 && (
        <section aria-labelledby="nf-picks" className="flex flex-col gap-3">
          <h2 id="nf-picks" className="font-display text-xl font-semibold">
            {t("picks")}
          </h2>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featured.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
