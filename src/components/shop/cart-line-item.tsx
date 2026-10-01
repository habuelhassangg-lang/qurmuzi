"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/store";
import type { QuotedCartLine } from "@/lib/cart/use-cart-quote";
import { calculateItemPrice } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils/currency";
import { formatNumber } from "@/lib/utils/numbers";
import { MAX_LINE_QUANTITY } from "@/lib/cart/limits";
import { ProductImage } from "./product-image";

export function CartLineItem({
  line,
  compact,
}: {
  line: QuotedCartLine;
  compact?: boolean;
}) {
  const t = useTranslations("Cart");
  const tSizes = useTranslations("Sizes");
  const locale = useLocale();
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const setOpen = useCart((s) => s.setOpen);

  const lineTotal = calculateItemPrice({
    variantPriceHalalas: line.variantPriceHalalas,
    addOnPricesHalalas: line.addOns.map((a) => a.priceHalalas),
    quantity: line.quantity,
  });

  return (
    <li className="flex gap-3 py-4" data-testid="cart-line">
      {/* Decorative thumbnail: the product name next to it is the link. */}
      {line.image && (
        <div className="w-20 shrink-0" aria-hidden>
          <ProductImage path={line.image} alt="" sizes="80px" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${line.slug}`}
            onClick={() => setOpen(false)}
            className="font-medium hover:text-crimson-600"
          >
            {line.name}
          </Link>
          <span className="shrink-0 font-medium" data-testid="cart-line-total">
            {formatPrice(lineTotal, locale)}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {tSizes(line.size)}
        </span>
        {line.addOns.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {t("withAddOns", {
              addOns: line.addOns.map((a) => a.name).join("، "),
            })}
          </span>
        )}
        {!compact && (
          <div className="mt-1 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("decrease")}
              disabled={line.quantity <= 1}
              onClick={() => setQuantity(line.key, line.quantity - 1)}
            >
              <Minus aria-hidden />
            </Button>
            <output
              aria-label={t("quantity")}
              className="min-w-8 text-center font-medium"
            >
              {formatNumber(line.quantity, locale)}
            </output>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("increase")}
              disabled={line.quantity >= MAX_LINE_QUANTITY}
              onClick={() => setQuantity(line.key, line.quantity + 1)}
            >
              <Plus aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="ms-auto text-muted-foreground"
              aria-label={t("remove", { name: line.name })}
              onClick={() => remove(line.key)}
            >
              <Trash2 aria-hidden />
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}
