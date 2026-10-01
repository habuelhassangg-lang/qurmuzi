"use client";

import { useLocale, useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import type { QuotedCartLine } from "@/lib/cart/use-cart-quote";
import type { Totals } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils/currency";
import { CartLineItem } from "../cart-line-item";

/** Always-visible order summary: a collapsible panel on mobile, a sticky sidebar on desktop. */
export function OrderSummary({
  lines,
  totals,
  deliveryKnown,
}: {
  lines: QuotedCartLine[] | null;
  totals: Totals | null;
  deliveryKnown: boolean;
}) {
  const t = useTranslations("Checkout");
  const locale = useLocale();

  const body = (
    <div className="flex flex-col gap-3">
      {lines ? (
        <ul className="divide-y">
          {lines.map((line) => (
            <CartLineItem key={line.key} line={line} compact />
          ))}
        </ul>
      ) : (
        <Skeleton className="h-24 w-full" />
      )}
      {totals && (
        <dl className="flex flex-col gap-2 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <dt>{t("subtotal")}</dt>
            <dd>{formatPrice(totals.subtotalHalalas, locale)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{t("deliveryFee")}</dt>
            <dd>
              {deliveryKnown
                ? formatPrice(totals.deliveryFeeHalalas, locale)
                : t("deliveryFeePending")}
            </dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-bold">
            <dt>{t("total")}</dt>
            <dd data-testid="checkout-total">
              {formatPrice(totals.totalHalalas, locale)}
            </dd>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("vatIncluded", { vat: formatPrice(totals.vatHalalas, locale) })}
          </p>
        </dl>
      )}
    </div>
  );

  return (
    <>
      <details className="rounded-xl border bg-surface p-4 lg:hidden">
        <summary className="flex min-h-11 cursor-pointer items-center justify-between font-medium">
          <span>{t("showSummary")}</span>
          {totals && (
            <span className="text-crimson-600">
              {formatPrice(totals.totalHalalas, locale)}
            </span>
          )}
        </summary>
        <div className="pt-3">{body}</div>
      </details>
      <aside aria-label={t("summary")} className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border bg-surface p-4">
          <h2 className="mb-3 font-display text-lg font-semibold">
            {t("summary")}
          </h2>
          {body}
        </div>
      </aside>
    </>
  );
}
