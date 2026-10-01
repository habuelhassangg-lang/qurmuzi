import type { Locale } from "@/i18n/routing";
import type { ProductDetail } from "@/lib/db/queries/catalog";
import { HALALAS_PER_RIYAL } from "@/lib/utils/currency";
import { absoluteUrl, localePath } from "@/lib/site";
import { IMAGE_LARGE_WIDTH } from "@/lib/catalog/images";

const toSar = (halalas: number) => (halalas / HALALAS_PER_RIYAL).toFixed(2);

export function productJsonLd(
  product: ProductDetail,
  locale: Locale,
  brand: string,
) {
  const prices = product.variants.map((v) => v.priceHalalas);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.slug,
    category: product.category.name,
    image: product.images.map((image) =>
      absoluteUrl(`${image.path}-${IMAGE_LARGE_WIDTH}.webp`),
    ),
    brand: { "@type": "Brand", name: brand },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "SAR",
      lowPrice: toSar(Math.min(...prices)),
      highPrice: toSar(Math.max(...prices)),
      offerCount: prices.length,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(localePath(locale, `/products/${product.slug}`)),
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function organizationJsonLd(
  locale: Locale,
  name: string,
  description: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    description,
    url: absoluteUrl(localePath(locale, "")),
    areaServed: [
      { "@type": "City", name: "Riyadh" },
      { "@type": "City", name: "Jeddah" },
      { "@type": "City", name: "Dammam" },
    ],
  };
}
