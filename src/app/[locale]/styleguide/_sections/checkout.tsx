"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CartLineItem } from "@/components/shop/cart-line-item";
import { DateSlotPicker } from "@/components/shop/checkout/date-slot-picker";
import { OrderSummary } from "@/components/shop/checkout/order-summary";
import {
  PaymentSection,
  type CardState,
} from "@/components/shop/checkout/payment-section";
import { FallingPetals } from "@/components/shop/falling-petals";
import { PolicySection } from "@/components/shop/policy-section";
import type { QuotedCartLine } from "@/lib/cart/use-cart-quote";
import type { DayAvailability } from "@/lib/delivery/availability";
import { TEST_CARD } from "@/lib/payments/card";
import type { PaymentMethodId } from "@/lib/payments";
import { calculateTotals } from "@/lib/pricing";
import { Section } from "./section";

// Fixed sample data: the styleguide never touches the database or the real cart.
const SAMPLE_LINE: QuotedCartLine = {
  key: "sample",
  productId: 1,
  variantId: 2,
  addOnIds: [1],
  quantity: 1,
  slug: "crimson-classic",
  name: "Crimson Classic",
  size: "large",
  image: "/images/products/crimson-classic-1",
  variantPriceHalalas: 34900,
  addOns: [{ id: 1, name: "Chocolate", priceHalalas: 5900 }],
};

const slots = (status: "available" | "full" | "too-soon") => [
  { id: 1, startsAt: "09:00", endsAt: "12:00", status },
  { id: 2, startsAt: "15:00", endsAt: "18:00", status: "available" as const },
];

const SAMPLE_DAYS: DayAvailability[] = [
  { date: "2026-10-01", status: "past-cutoff", slots: [] },
  { date: "2026-10-02", status: "available", slots: slots("too-soon") },
  { date: "2026-10-03", status: "available", slots: slots("full") },
  { date: "2026-10-04", status: "blackout", slots: [] },
  { date: "2026-10-05", status: "full", slots: [] },
];

export function CheckoutSection() {
  const t = useTranslations("Styleguide");
  const [date, setDate] = useState<string>();
  const [slotId, setSlotId] = useState<number>();
  const [method, setMethod] = useState<PaymentMethodId>("mada");
  const [card, setCard] = useState<CardState>({ ...TEST_CARD });
  const [petals, setPetals] = useState(0);
  const totals = calculateTotals({
    lines: [{ variantPriceHalalas: 34900, addOnPricesHalalas: [5900] }],
    deliveryFeeHalalas: 2500,
  });

  return (
    <Section id="checkout" title={t("checkout")}>
      <ul className="max-w-md divide-y rounded-xl border bg-surface px-4">
        <CartLineItem line={SAMPLE_LINE} />
      </ul>
      <DateSlotPicker
        days={SAMPLE_DAYS}
        date={date}
        slotId={slotId}
        onDateChange={setDate}
        onSlotChange={setSlotId}
      />
      <PaymentSection
        method={method}
        onMethodChange={setMethod}
        totalHalalas={totals.totalHalalas}
        card={card}
        onCardChange={setCard}
      />
      <div className="max-w-sm">
        <OrderSummary lines={[SAMPLE_LINE]} totals={totals} deliveryKnown />
      </div>
      <PolicySection id="sg-policy" title={t("policySample")}>
        <p>{t("dialogBody")}</p>
      </PolicySection>
      <div>
        <Button variant="outline" onClick={() => setPetals((n) => n + 1)}>
          {t("showPetals")}
        </Button>
        {petals > 0 && <FallingPetals key={petals} />}
      </div>
    </Section>
  );
}
