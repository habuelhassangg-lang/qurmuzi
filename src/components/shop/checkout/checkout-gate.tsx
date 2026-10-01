"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/store";
import type { CheckoutForm as CheckoutFormType } from "./checkout-form";
import { CheckoutSkeleton } from "./checkout-skeleton";

// The form (Zod, react-hook-form, Radix Select/Dialog) is only downloaded when the cart has items.
const CheckoutForm = dynamic(
  () => import("./checkout-form").then((m) => m.CheckoutForm),
  {
    ssr: false,
    loading: () => <CheckoutSkeleton />,
  },
);

/** Reads the saved cart, then shows the empty state or loads the checkout form. */
export function CheckoutGate(props: ComponentProps<typeof CheckoutFormType>) {
  const t = useTranslations("Cart");
  const hydrated = useCart((s) => s.hydrated);
  const count = useCart((s) => s.lines.length);

  if (!hydrated) return <CheckoutSkeleton />;

  if (count === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-16 text-center">
        <p className="font-display text-xl font-semibold">{t("emptyTitle")}</p>
        <Button asChild>
          <Link href="/catalog">{t("browse")}</Link>
        </Button>
      </div>
    );
  }

  return <CheckoutForm {...props} />;
}
