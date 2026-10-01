"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCart } from "@/lib/cart/store";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { ProductDetail } from "@/lib/db/queries/catalog";
import { calculateItemPrice } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils/currency";

type Props = Pick<ProductDetail, "id" | "slug" | "variants" | "addOns">;

/**
 * Size + add-on picker with a live price. Prices shown here are for display
 * only: the cart stores IDs, and the server re-prices the order (M4).
 */
export function ProductPurchase({
  id: productId,
  slug,
  variants,
  addOns,
}: Props) {
  const t = useTranslations("Product");
  const tSizes = useTranslations("Sizes");
  const locale = useLocale();
  const id = useId();
  const [variantId, setVariantId] = useState(variants[0]?.id);
  const [addOnIds, setAddOnIds] = useState<number[]>([]);
  const addToCart = useCart((state) => state.add);
  const openCart = useCart((state) => state.setOpen);

  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  if (!variant) return null;
  const total = calculateItemPrice({
    variantPriceHalalas: variant.priceHalalas,
    addOnPricesHalalas: addOns
      .filter((a) => addOnIds.includes(a.id))
      .map((a) => a.priceHalalas),
  });

  const toggleAddOn = (addOnId: number, checked: boolean) =>
    setAddOnIds((ids) =>
      checked ? [...ids, addOnId] : ids.filter((i) => i !== addOnId),
    );

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-medium">{t("size")}</legend>
        <RadioGroup
          value={String(variant.id)}
          onValueChange={(value) => setVariantId(Number(value))}
          className="grid grid-cols-3 gap-2"
        >
          {variants.map((v) => (
            <label
              key={v.id}
              htmlFor={`${id}-size-${v.id}`}
              className="group flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border bg-surface p-2 text-center has-[[data-state=checked]]:border-crimson-600 has-[[data-state=checked]]:bg-crimson-50"
            >
              <RadioGroupItem
                id={`${id}-size-${v.id}`}
                value={String(v.id)}
                className="sr-only"
              />
              <span className="font-medium">{tSizes(v.size)}</span>
              <span className="text-sm text-muted-foreground group-has-[[data-state=checked]]:text-crimson-700">
                {formatPrice(v.priceHalalas, locale)}
              </span>
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      {addOns.length > 0 && (
        <fieldset className="flex flex-col">
          <legend className="mb-2 font-medium">{t("addOns")}</legend>
          {addOns.map((addOn) => (
            <label
              key={addOn.id}
              className="flex min-h-11 cursor-pointer items-center gap-3"
            >
              <Checkbox
                checked={addOnIds.includes(addOn.id)}
                onCheckedChange={(checked) =>
                  toggleAddOn(addOn.id, checked === true)
                }
              />
              <span className="flex-1">{addOn.name}</span>
              <span className="text-sm text-muted-foreground">
                {t("addOnPrice", {
                  price: formatPrice(addOn.priceHalalas, locale),
                })}
              </span>
            </label>
          ))}
        </fieldset>
      )}

      {/* Pinned to the bottom of the screen on mobile, inline on larger screens. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">{t("total")}</span>
          <output
            aria-live="polite"
            data-testid="live-price"
            className="text-xl font-bold text-crimson-600"
          >
            {formatPrice(total, locale)}
          </output>
          <span className="text-xs text-muted-foreground">
            {t("vatIncluded")}
          </span>
        </div>
        <Button
          size="lg"
          className="flex-1"
          onClick={() => {
            addToCart({
              productId,
              variantId: variant.id,
              addOnIds,
              quantity: 1,
            });
            track("add_to_cart", {
              item_id: slug,
              value: total / 100,
              currency: "SAR",
              quantity: 1,
            });
            toast.success(t("addedToCart"), {
              action: { label: t("viewCart"), onClick: () => openCart(true) },
            });
          }}
        >
          {t("addToCart")}
        </Button>
      </div>
    </div>
  );
}
