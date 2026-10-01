"use client";

import { ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cartCount, useCart } from "@/lib/cart/store";
import { formatNumber } from "@/lib/utils/numbers";

/**
 * Header bag icon with the item count; opens the cart drawer. It is also the
 * anchor for the L1 "flower flies into the bag" moment (`data-cart-target`).
 */
export function CartButton() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const hydrated = useCart((s) => s.hydrated);
  const lines = useCart((s) => s.lines);
  const setOpen = useCart((s) => s.setOpen);
  // Before the cart is read from storage, show 0 so server and client render the same.
  const count = hydrated ? cartCount(lines) : 0;
  const formatted = formatNumber(count, locale);

  return (
    <button
      type="button"
      data-cart-target
      onClick={() => setOpen(true)}
      aria-label={t("cart", { count, formatted })}
      className="relative inline-flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-accent"
    >
      <ShoppingBag className="size-6" aria-hidden />
      {count > 0 && (
        <span
          aria-hidden
          data-testid="cart-count"
          className="absolute -end-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-crimson-600 px-1 text-xs leading-5 font-medium text-cream"
        >
          {formatted}
        </span>
      )}
    </button>
  );
}
