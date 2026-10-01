import { ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatNumber } from "@/lib/utils/numbers";

/**
 * Cart icon with item count. The count is static (0) until the cart store
 * lands in M4. The icon is the anchor for the L1 "flower flies into the bag" moment.
 */
export function CartButton({ count = 0 }: { count?: number }) {
  const t = useTranslations("Header");
  const locale = useLocale();
  const formatted = formatNumber(count, locale);

  return (
    <Link
      href="/cart"
      // The cart page arrives in M4; avoid prefetching a 404 until then.
      prefetch={false}
      data-cart-target
      aria-label={t("cart", { count, formatted })}
      className="relative inline-flex size-11 items-center justify-center rounded-full hover:bg-accent"
    >
      <ShoppingBag className="size-6" aria-hidden />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -end-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-crimson-600 px-1 text-xs leading-5 font-medium text-cream"
        >
          {formatted}
        </span>
      )}
    </Link>
  );
}
