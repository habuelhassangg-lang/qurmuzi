"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { createOrderAction } from "@/app/actions/order";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRouter } from "@/i18n/navigation";
import { track } from "@/lib/analytics";
import { useCart } from "@/lib/cart/store";
import { useCartQuote } from "@/lib/cart/use-cart-quote";
import type { CityOption } from "@/lib/db/queries/checkout";
import type { DayAvailability } from "@/lib/delivery/availability";
import { paymentMethods, type PaymentMethodId } from "@/lib/payments";
import {
  isValidCvv,
  isValidExpiry,
  isValidLuhn,
  TEST_CARD,
} from "@/lib/payments/card";
import { calculateTotals } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils/currency";
import { formatNumber } from "@/lib/utils/numbers";
import { DateSlotPicker } from "./date-slot-picker";
import { Field, fieldAria } from "./field";
import {
  checkoutFormSchema,
  STEP_FIELDS,
  type CheckoutFormInput,
  type CheckoutFormOutput,
} from "./form-schema";
import { OrderSummary } from "./order-summary";
import { PaymentSection, type CardState } from "./payment-section";

/** Demo OTP for the mock STC Pay flow; shown on screen, never a real code. */
const DEMO_OTP = "1234";

type Props = {
  zones: CityOption[];
  availability: DayAvailability[];
  giftMessageMaxLength: number;
};

type PendingConfirm = "apple_pay" | "stc_pay" | null;

export function CheckoutForm({
  zones,
  availability,
  giftMessageMaxLength,
}: Props) {
  const t = useTranslations("Checkout");
  const tErrors = useTranslations("Checkout.errors");
  const tOrderErrors = useTranslations("Checkout.orderErrors");
  const tPay = useTranslations("Payment");
  const tCart = useTranslations("Cart");
  const locale = useLocale();
  const router = useRouter();
  const { lines, hydrated } = useCartQuote();
  const clearCart = useCart((s) => s.clear);
  const openCart = useCart((s) => s.setOpen);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [card, setCard] = useState<CardState>({ ...TEST_CARD });
  const [cardError, setCardError] = useState<string>();
  const [confirm, setConfirm] = useState<PendingConfirm>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const pendingValues = useRef<CheckoutFormOutput | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const form = useForm<CheckoutFormInput, unknown, CheckoutFormOutput>({
    resolver: zodResolver(checkoutFormSchema),
    mode: "onTouched",
    defaultValues: {
      recipient: {
        recipientName: "",
        recipientPhone: "",
        addressLine: "",
        nationalAddressCode: "",
        deliveryDate: "",
      },
      gift: {
        giftMessage: "",
        hidePrice: false,
        anonymousSender: false,
        surprise: false,
      },
      buyer: {
        buyerName: "",
        buyerPhone: "",
        buyerEmail: "",
        paymentMethod: "mada",
      },
    },
  });
  const {
    register,
    control,
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState,
  } = form;
  const errors: FieldErrors<CheckoutFormInput> = formState.errors;

  const cityId = watch("recipient.cityId");
  const districtId = watch("recipient.districtId");
  const deliveryDate = watch("recipient.deliveryDate");
  const slotId = watch("recipient.slotId");
  const method = watch("buyer.paymentMethod") as PaymentMethodId;
  const giftMessage = watch("gift.giftMessage") ?? "";

  const city = zones.find((c) => c.id === cityId);
  const district = city?.districts.find((d) => d.id === districtId);

  const totals = useMemo(() => {
    if (!lines || lines.length === 0) return null;
    return calculateTotals({
      lines: lines.map((l) => ({
        variantPriceHalalas: l.variantPriceHalalas,
        addOnPricesHalalas: l.addOns.map((a) => a.priceHalalas),
        quantity: l.quantity,
      })),
      deliveryFeeHalalas: district?.deliveryFeeHalalas ?? 0,
    });
  }, [lines, district]);

  // begin_checkout fires once the cart is priced.
  const trackedBegin = useRef(false);
  useEffect(() => {
    if (totals && !trackedBegin.current) {
      trackedBegin.current = true;
      track("begin_checkout", {
        value: totals.totalHalalas / 100,
        currency: "SAR",
      });
    }
  }, [totals]);

  const goTo = (next: number) => {
    setStep(next);
    // Move focus to the step heading so keyboard and screen-reader users follow along.
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const nextStep = async () => {
    if (await trigger(STEP_FIELDS[step])) goTo(step + 1);
  };

  const placeOrder = async (values: CheckoutFormOutput) => {
    if (!lines || !totals) return;
    setSubmitting(true);
    try {
      const auth = await paymentMethods[values.buyer.paymentMethod].authorize(
        totals.totalHalalas,
      );
      if (!auth.ok) {
        toast.error(tOrderErrors("unknown"));
        return;
      }
      track("add_payment_info", {
        payment_type: values.buyer.paymentMethod,
        value: totals.totalHalalas / 100,
        currency: "SAR",
      });
      const result = await createOrderAction({
        locale,
        items: lines.map(({ productId, variantId, addOnIds, quantity }) => ({
          productId,
          variantId,
          addOnIds,
          quantity,
        })),
        recipient: values.recipient,
        gift: values.gift,
        buyer: values.buyer,
        paymentReference: auth.reference,
      });
      if (result.ok) {
        clearCart();
        router.push(`/orders/${result.orderId}`);
        return;
      }
      toast.error(tOrderErrors(result.error));
      if (
        result.error === "slot_unavailable" ||
        result.error === "invalid_zone"
      ) {
        setValue("recipient.slotId", undefined as unknown as number);
        goTo(0);
        router.refresh();
      } else if (result.error === "cart_changed") {
        openCart(true);
      }
    } catch {
      toast.error(tOrderErrors("unknown"));
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (values.buyer.paymentMethod === "mada") {
      const valid =
        isValidLuhn(card.number) &&
        isValidExpiry(card.expiry) &&
        isValidCvv(card.cvv) &&
        card.name.trim();
      if (!valid) {
        setCardError(tErrors("card"));
        return;
      }
      setCardError(undefined);
    }
    if (
      values.buyer.paymentMethod === "apple_pay" ||
      values.buyer.paymentMethod === "stc_pay"
    ) {
      pendingValues.current = values;
      setOtp("");
      setOtpError(false);
      setConfirm(values.buyer.paymentMethod);
      return;
    }
    await placeOrder(values);
  });

  const confirmDialog = async () => {
    if (confirm === "stc_pay" && otp.trim() !== DEMO_OTP) {
      setOtpError(true);
      return;
    }
    setConfirm(null);
    if (pendingValues.current) await placeOrder(pendingValues.current);
  };

  if (hydrated && lines && lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-16 text-center">
        <p className="font-display text-xl font-semibold">
          {tCart("emptyTitle")}
        </p>
        <Button asChild>
          <Link href="/catalog">{tCart("browse")}</Link>
        </Button>
      </div>
    );
  }

  const stepTitles = [t("step1"), t("step2"), t("step3")];
  const totalLabel = totals ? formatPrice(totals.totalHalalas, locale) : "";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      {/* min-w-0 keeps the horizontally scrolling date strip from widening the grid. */}
      <div className="order-2 flex min-w-0 flex-col gap-6 lg:order-1">
        <nav aria-label={t("steps")}>
          <ol className="flex gap-2">
            {stepTitles.map((title, index) => (
              <li
                key={title}
                aria-current={index === step ? "step" : undefined}
                className={`flex flex-1 flex-col gap-1 border-t-4 pt-2 text-xs sm:text-sm ${
                  index <= step
                    ? "border-crimson-600 font-medium"
                    : "border-line text-muted-foreground"
                }`}
              >
                <span>{formatNumber(index + 1, locale)}</span>
                <span>{title}</span>
              </li>
            ))}
          </ol>
        </nav>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-2xl font-semibold outline-none"
          >
            <span className="sr-only">
              {t("stepOf", {
                current: formatNumber(step + 1, locale),
                total: formatNumber(3, locale),
              })}
              :{" "}
            </span>
            {stepTitles[step]}
          </h2>

          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="recipientName"
                  label={t("recipientName")}
                  error={errors.recipient?.recipientName && tErrors("name")}
                >
                  <Input
                    {...fieldAria(
                      "recipientName",
                      errors.recipient?.recipientName?.message,
                    )}
                    autoComplete="off"
                    {...register("recipient.recipientName")}
                  />
                </Field>
                <Field
                  id="recipientPhone"
                  label={t("recipientPhone")}
                  error={errors.recipient?.recipientPhone && tErrors("mobile")}
                >
                  <Input
                    {...fieldAria(
                      "recipientPhone",
                      errors.recipient?.recipientPhone?.message,
                    )}
                    type="tel"
                    dir="ltr"
                    inputMode="tel"
                    className="text-start"
                    placeholder={t("phonePlaceholder")}
                    {...register("recipient.recipientPhone")}
                  />
                </Field>
                <Field
                  id="city"
                  label={t("city")}
                  error={errors.recipient?.cityId && tErrors("required")}
                >
                  <Controller
                    control={control}
                    name="recipient.cityId"
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(value) => {
                          field.onChange(Number(value));
                          setValue(
                            "recipient.districtId",
                            undefined as unknown as number,
                          );
                        }}
                      >
                        <SelectTrigger
                          id="city"
                          className="w-full"
                          aria-invalid={!!errors.recipient?.cityId}
                        >
                          <SelectValue placeholder={t("cityPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field
                  id="district"
                  label={t("district")}
                  error={errors.recipient?.districtId && tErrors("required")}
                >
                  <Controller
                    control={control}
                    name="recipient.districtId"
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(value) => field.onChange(Number(value))}
                        disabled={!city}
                      >
                        <SelectTrigger
                          id="district"
                          className="w-full"
                          aria-invalid={!!errors.recipient?.districtId}
                        >
                          <SelectValue placeholder={t("districtPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {city?.districts.map((d) => (
                            <SelectItem key={d.id} value={String(d.id)}>
                              {d.name} ·{" "}
                              {formatPrice(d.deliveryFeeHalalas, locale)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </div>
              <Field
                id="addressLine"
                label={t("addressLine")}
                error={errors.recipient?.addressLine && tErrors("address")}
              >
                <Input
                  {...fieldAria(
                    "addressLine",
                    errors.recipient?.addressLine?.message,
                  )}
                  placeholder={t("addressPlaceholder")}
                  {...register("recipient.addressLine")}
                />
              </Field>
              <Field
                id="nationalAddressCode"
                label={t("nationalAddress")}
                hint={t("nationalAddressHint")}
                error={
                  errors.recipient?.nationalAddressCode &&
                  tErrors("nationalAddress")
                }
              >
                <Input
                  {...fieldAria(
                    "nationalAddressCode",
                    errors.recipient?.nationalAddressCode?.message,
                    t("nationalAddressHint"),
                  )}
                  dir="ltr"
                  className="text-start uppercase"
                  placeholder="RRRD2929"
                  {...register("recipient.nationalAddressCode")}
                />
              </Field>
              <DateSlotPicker
                days={availability}
                date={deliveryDate || undefined}
                slotId={slotId}
                onDateChange={(date) => {
                  setValue("recipient.deliveryDate", date, {
                    shouldValidate: true,
                  });
                  setValue("recipient.slotId", undefined as unknown as number);
                }}
                onSlotChange={(id) =>
                  setValue("recipient.slotId", id, { shouldValidate: true })
                }
                dateError={errors.recipient?.deliveryDate && tErrors("date")}
                slotError={errors.recipient?.slotId && tErrors("slot")}
              />
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <Field
                id="giftMessage"
                label={t("giftMessage")}
                hint={t("charactersLeft", {
                  count: formatNumber(
                    Math.max(0, giftMessageMaxLength - giftMessage.length),
                    locale,
                  ),
                })}
                error={errors.gift?.giftMessage && tErrors("giftTooLong")}
              >
                <Textarea
                  {...fieldAria(
                    "giftMessage",
                    errors.gift?.giftMessage?.message,
                    "hint",
                  )}
                  maxLength={giftMessageMaxLength}
                  placeholder={t("giftPlaceholder")}
                  {...register("gift.giftMessage")}
                />
              </Field>
              {(["hidePrice", "anonymousSender", "surprise"] as const).map(
                (name) => (
                  <Controller
                    key={name}
                    control={control}
                    name={`gift.${name}`}
                    render={({ field }) => (
                      <label className="flex min-h-11 cursor-pointer items-center gap-3">
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                        />
                        {t(name === "anonymousSender" ? "anonymous" : name)}
                      </label>
                    )}
                  />
                ),
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="buyerName"
                  label={t("buyerName")}
                  error={errors.buyer?.buyerName && tErrors("name")}
                >
                  <Input
                    {...fieldAria(
                      "buyerName",
                      errors.buyer?.buyerName?.message,
                    )}
                    autoComplete="name"
                    {...register("buyer.buyerName")}
                  />
                </Field>
                <Field
                  id="buyerPhone"
                  label={t("buyerPhone")}
                  error={errors.buyer?.buyerPhone && tErrors("mobile")}
                >
                  <Input
                    {...fieldAria(
                      "buyerPhone",
                      errors.buyer?.buyerPhone?.message,
                    )}
                    type="tel"
                    dir="ltr"
                    inputMode="tel"
                    autoComplete="tel"
                    className="text-start"
                    placeholder={t("phonePlaceholder")}
                    {...register("buyer.buyerPhone")}
                  />
                </Field>
              </div>
              <Field
                id="buyerEmail"
                label={t("buyerEmail")}
                error={errors.buyer?.buyerEmail && tErrors("email")}
              >
                <Input
                  {...fieldAria(
                    "buyerEmail",
                    errors.buyer?.buyerEmail?.message,
                  )}
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  className="text-start"
                  placeholder={t("emailPlaceholder")}
                  {...register("buyer.buyerEmail")}
                />
              </Field>
              <PaymentSection
                method={method}
                onMethodChange={(id) => setValue("buyer.paymentMethod", id)}
                totalHalalas={totals?.totalHalalas ?? 0}
                card={card}
                onCardChange={setCard}
                cardError={cardError}
              />
            </div>
          )}

          <div className="flex items-center gap-3 border-t pt-4">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => goTo(step - 1)}
                disabled={submitting}
              >
                {t("back")}
              </Button>
            )}
            {step < 2 ? (
              <Button type="button" className="ms-auto" onClick={nextStep}>
                {t("next")}
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                className="ms-auto"
                disabled={submitting || !totals}
              >
                {submitting
                  ? t("placing")
                  : t("placeOrder", { total: totalLabel })}
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="order-1 min-w-0 lg:order-2">
        <OrderSummary
          lines={lines}
          totals={totals}
          deliveryKnown={!!district}
        />
      </div>

      <Dialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirm === "stc_pay" ? tPay("stcTitle") : tPay("applePayTitle")}
            </DialogTitle>
            <DialogDescription>
              {confirm === "stc_pay"
                ? tPay("stcBody", { code: DEMO_OTP })
                : tPay("applePayBody", { total: totalLabel })}
            </DialogDescription>
          </DialogHeader>
          {confirm === "stc_pay" && (
            <Field
              id="stc-otp"
              label={tPay("otp")}
              error={otpError ? tPay("otpInvalid") : undefined}
            >
              <Input
                id="stc-otp"
                dir="ltr"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="text-start"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </Field>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirm(null)}
            >
              {tPay("cancel")}
            </Button>
            <Button type="button" onClick={confirmDialog}>
              {confirm === "stc_pay"
                ? tPay("stcConfirm")
                : tPay("applePayConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
