import { useLocale, useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import type { ProductCardData } from "@/lib/db/queries/catalog";
import { formatPrice } from "@/lib/utils/currency";
import { ProductImage } from "./product-image";

export function ProductCard({
  product,
  priority,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const t = useTranslations("Catalog");
  const locale = useLocale();

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-3 rounded-xl focus-visible:outline-offset-4"
    >
      {product.image && (
        <ProductImage
          path={product.image.path}
          alt={product.image.alt}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          priority={priority}
          transitionName={`product-${product.slug}`}
          className="transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      )}
      <div className="flex flex-col gap-1">
        <h2 className="font-medium">{product.name}</h2>
        <p className="text-sm text-crimson-600">
          {t("from", { price: formatPrice(product.fromPriceHalalas, locale) })}
        </p>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <Skeleton className="aspect-[4/5] w-full rounded-xl" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}
