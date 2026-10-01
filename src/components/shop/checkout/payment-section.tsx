"use client";

import { CreditCard } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  calculateInstallments,
  PAYMENT_METHODS,
  paymentMethods,
  type PaymentMethodId,
} from "@/lib/payments";
import { formatCardNumber } from "@/lib/payments/card";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/currency";
import { formatNumber } from "@/lib/utils/numbers";
import { Field } from "./field";

export type CardState = {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
};

type Props = {
  method: PaymentMethodId;
  onMethodChange: (method: PaymentMethodId) => void;
  totalHalalas: number;
  /** Card fields live in component state only: they are never part of the submitted order. */
  card: CardState;
  onCardChange: (card: CardState) => void;
  cardError?: string;
};

export function PaymentSection({
  method,
  onMethodChange,
  totalHalalas,
  card,
  onCardChange,
  cardError,
}: Props) {
  const t = useTranslations("Payment");
  const tCheckout = useTranslations("Checkout");
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-xl bg-crimson-50 px-4 py-3 text-sm text-crimson-700">
        {tCheckout("demoPayment")}
      </p>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">
          {tCheckout("paymentMethod")}
        </legend>
        <div
          role="radiogroup"
          aria-label={tCheckout("paymentMethod")}
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        >
          {PAYMENT_METHODS.map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={method === id}
              data-method={id}
              onClick={() => onMethodChange(id)}
              className={cn(
                "flex min-h-14 cursor-pointer items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors",
                method === id
                  ? "border-crimson-600 bg-crimson-50"
                  : "border-line bg-surface hover:border-crimson-600",
              )}
            >
              {t(id)}
            </button>
          ))}
        </div>
      </fieldset>

      {method === "mada" && (
        <div
          className="flex flex-col gap-3 rounded-xl border bg-surface p-4"
          data-testid="card-form"
        >
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <CreditCard className="size-4" aria-hidden />
            {t("testCard")}
          </p>
          {/* No `name` attributes: these fields are never submitted anywhere. */}
          <Field id="card-number" label={t("cardNumber")} error={cardError}>
            <Input
              id="card-number"
              dir="ltr"
              inputMode="numeric"
              autoComplete="cc-number"
              className="text-start"
              value={card.number}
              onChange={(e) =>
                onCardChange({
                  ...card,
                  number: formatCardNumber(e.target.value),
                })
              }
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field id="card-expiry" label={t("expiry")}>
              <Input
                id="card-expiry"
                dir="ltr"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                className="text-start"
                value={card.expiry}
                onChange={(e) =>
                  onCardChange({ ...card, expiry: e.target.value })
                }
              />
            </Field>
            <Field id="card-cvv" label={t("cvv")}>
              <Input
                id="card-cvv"
                dir="ltr"
                inputMode="numeric"
                autoComplete="cc-csc"
                className="text-start"
                value={card.cvv}
                onChange={(e) => onCardChange({ ...card, cvv: e.target.value })}
              />
            </Field>
          </div>
          <Field id="card-name" label={t("cardName")}>
            <Input
              id="card-name"
              dir="ltr"
              autoComplete="cc-name"
              className="text-start"
              value={card.name}
              onChange={(e) => onCardChange({ ...card, name: e.target.value })}
            />
          </Field>
        </div>
      )}

      {paymentMethods[method].installments && (
        <div
          className="rounded-xl border bg-surface p-4"
          data-testid="installments"
        >
          <p className="mb-3 font-medium">{t("installmentsTitle")}</p>
          <ol className="grid grid-cols-4 gap-2 text-center">
            {calculateInstallments(totalHalalas).map((amount, index) => (
              <li
                key={index}
                className="flex flex-col gap-1 rounded-md bg-muted p-2"
              >
                <span className="text-sm font-semibold">
                  {formatPrice(amount, locale)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {index === 0
                    ? t("installmentToday")
                    : t("installmentMonth", {
                        count: index,
                        formatted: formatNumber(index, locale),
                      })}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {method === "cash_on_delivery" && (
        <p className="rounded-xl border bg-surface p-4 text-sm">
          {t("codNote")}
        </p>
      )}
    </div>
  );
}
