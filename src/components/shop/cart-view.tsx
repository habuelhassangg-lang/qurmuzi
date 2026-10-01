"use client";

import { ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/store";
import { useCartQuote } from "@/lib/cart/use-cart-quote";
import { calculateTotals } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils/currency";
import { CartLineItem } from "./cart-line-item";

/** Cart contents + subtotal + checkout button. Used in the drawer and on /cart. */
export function CartView({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const { lines, loading, error, retry, removedCount, hydrated } =
    useCartQuote();
  const count = useCart((s) => s.lines.length);

  useEffect(() => {
    if (removedCount > 0) toast(t("itemsRemoved"));
  }, [removedCount, t]);

  if (!hydrated || loading) {
    return (
      <div
        className="flex flex-col gap-4 p-4"
        aria-busy="true"
        aria-label={t("loading")}
      >
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="aspect-[4/5] w-20 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Pricing failed: never pretend the cart is empty.
  if (count > 0 && error && !lines) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-12 text-center"
        role="alert"
      >
        <p className="text-destructive">{t("quoteError")}</p>
        <Button variant="outline" onClick={retry}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (count === 0 || !lines || lines.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-12 text-center">
        <ShoppingBag className="size-10 text-crimson-600" aria-hidden />
        <p className="font-display text-xl font-semibold">{t("emptyTitle")}</p>
        <p className="text-muted-foreground">{t("emptyBody")}</p>
        <Button asChild className="mt-2">
          <Link href="/catalog" onClick={onNavigate}>
            {t("browse")}
          </Link>
        </Button>
      </div>
    );
  }

  const totals = calculateTotals({
    lines: lines.map((l) => ({
      variantPriceHalalas: l.variantPriceHalalas,
      addOnPricesHalalas: l.addOns.map((a) => a.priceHalalas),
      quantity: l.quantity,
    })),
    deliveryFeeHalalas: 0,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ul className="flex-1 divide-y overflow-y-auto px-4">
        {lines.map((line) => (
          <CartLineItem key={line.key} line={line} />
        ))}
      </ul>
      <div className="flex flex-col gap-3 border-t p-4">
        {error && <p className="text-sm text-destructive">{t("quoteError")}</p>}
        <div className="flex items-center justify-between font-medium">
          <span>{t("subtotal")}</span>
          <span data-testid="cart-subtotal">
            {formatPrice(totals.subtotalHalalas, locale)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{t("deliveryNote")}</p>
        <Button asChild size="lg">
          <Link href="/checkout" onClick={onNavigate}>
            {t("checkout")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
