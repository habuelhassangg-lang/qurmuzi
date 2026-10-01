import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { listProductSlugs } from "@/lib/db/queries/catalog";
import { absoluteUrl, HREFLANG, localePath } from "@/lib/site";

// Built per request (cached by the CDN), so the build never needs the database.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await listProductSlugs();
  const paths = [
    "",
    "/catalog",
    "/delivery-policy",
    "/privacy",
    ...slugs.map((slug) => `/products/${slug}`),
  ];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(localePath(locale, path)),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [
            HREFLANG[l],
            absoluteUrl(localePath(l, path)),
          ]),
        ),
      },
    })),
  );
}
