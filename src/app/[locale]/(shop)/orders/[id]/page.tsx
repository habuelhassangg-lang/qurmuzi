import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import QRCode from "qrcode";
import { FallingPetals } from "@/components/shop/falling-petals";
import { PurchaseTracker } from "@/components/shop/purchase-tracker";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getOrderForInvoice } from "@/lib/db/queries/orders";
import { encodeZatcaTlv } from "@/lib/invoice/zatca";
import { HALALAS_PER_RIYAL, formatPrice } from "@/lib/utils/currency";
import { formatDate, formatHour, riyadhNoon } from "@/lib/utils/dates";
import { formatNumber } from "@/lib/utils/numbers";
import { formatSaudiMobile } from "@/lib/utils/phone";

// Orders are private and change per request.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/orders/[id]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Order" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function OrderPage({
  params,
}: PageProps<"/[locale]/orders/[id]">) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const order = await getOrderForInvoice(id, locale);
  if (!order) notFound();

  const [t, tSizes, tPay] = await Promise.all([
    getTranslations("Order"),
    getTranslations("Sizes"),
    getTranslations("Payment"),
  ]);

  const toSar = (halalas: number) => (halalas / HALALAS_PER_RIYAL).toFixed(2);
  const netHalalas = order.totalHalalas - order.vatHalalas;
  const qrPayload = encodeZatcaTlv({
    sellerName: order.sellerName,
    vatNumber: order.vatNumber,
    timestamp: order.createdAt,
    totalWithVat: toSar(order.totalHalalas),
    vatAmount: toSar(order.vatHalalas),
  });
  const qrSvg = await QRCode.toString(qrPayload, {
    type: "svg",
    margin: 1,
    width: 160,
    errorCorrectionLevel: "M",
  });
  const deliveryDay = riyadhNoon(order.deliveryDate);
  const slot = `${formatHour(Number(order.slot.startsAt.slice(0, 2)), locale)} – ${formatHour(Number(order.slot.endsAt.slice(0, 2)), locale)}`;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <FallingPetals />
      <PurchaseTracker
        orderNumber={order.orderNumber}
        value={order.totalHalalas / HALALAS_PER_RIYAL}
      />

      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-display text-4xl font-bold text-crimson-600">
          {t("title")}
        </h1>
        <p className="text-lg">{t("body")}</p>
        <p className="flex flex-col items-center gap-1">
          <span className="text-sm text-muted-foreground">
            {t("orderNumber")}
          </span>
          <bdi
            dir="ltr"
            data-testid="order-number"
            className="font-mono text-xl font-semibold"
          >
            {order.orderNumber}
          </bdi>
        </p>
        <p className="rounded-full bg-crimson-50 px-4 py-2 text-sm text-crimson-700">
          {t("demoNote")}
        </p>
      </header>

      <section
        aria-labelledby="delivery-title"
        className="rounded-xl border bg-surface p-5"
      >
        <h2
          id="delivery-title"
          className="mb-3 font-display text-xl font-semibold"
        >
          {t("delivery")}
        </h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted-foreground">{t("recipient")}</dt>
          <dd>
            {order.recipientName} ·{" "}
            <bdi dir="ltr">{formatSaudiMobile(order.recipientPhone)}</bdi>
          </dd>
          <dt className="text-muted-foreground">{t("date")}</dt>
          <dd data-testid="order-date">
            {formatDate(deliveryDay, locale, "gregory", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {" · "}
            {formatDate(deliveryDay, locale, "islamic-umalqura")}
          </dd>
          <dt className="text-muted-foreground">{t("time")}</dt>
          <dd>{slot}</dd>
          <dt className="text-muted-foreground">{t("address")}</dt>
          <dd>
            {order.city}، {order.district}، {order.addressLine}
            {order.nationalAddressCode && (
              <>
                {" · "}
                <bdi dir="ltr">{order.nationalAddressCode}</bdi>
              </>
            )}
          </dd>
          {order.giftMessage && (
            <>
              <dt className="text-muted-foreground">{t("gift")}</dt>
              <dd className="whitespace-pre-line">{order.giftMessage}</dd>
            </>
          )}
        </dl>
      </section>

      <section
        aria-labelledby="invoice-title"
        className="rounded-xl border bg-surface p-5"
        data-testid="invoice"
      >
        <h2
          id="invoice-title"
          className="mb-1 font-display text-xl font-semibold"
        >
          {t("invoice")}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t("seller")}: {order.sellerName} · {t("vatNumber")}:{" "}
          <bdi dir="ltr">{order.vatNumber}</bdi> · {t("issued")}:{" "}
          {formatDate(order.createdAt, locale, "gregory", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>

        <h3 className="mb-2 font-medium">{t("items")}</h3>
        <ul className="mb-4 divide-y text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-2">
              <span>
                {item.name} · {tSizes(item.size)}
                {item.addOns.length > 0 && (
                  <span className="text-muted-foreground">
                    {" "}
                    + {item.addOns.join("، ")}
                  </span>
                )}{" "}
                <span className="text-muted-foreground">
                  {t("quantity", {
                    count: formatNumber(item.quantity, locale),
                  })}
                </span>
              </span>
              <span className="shrink-0">
                {formatPrice(item.unitPriceHalalas * item.quantity, locale)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-end sm:justify-between">
          <figure className="flex flex-col items-center gap-2">
            <div
              className="size-40 rounded-md bg-white p-1"
              role="img"
              aria-label={t("qrLabel")}
              data-testid="zatca-qr"
              data-payload={qrPayload}
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <figcaption className="max-w-40 text-center text-xs text-muted-foreground">
              {t("qrLabel")}
            </figcaption>
          </figure>
          <dl className="flex min-w-64 flex-col gap-2 text-sm">
            <div className="flex justify-between gap-6">
              <dt>{t("subtotal")}</dt>
              <dd>{formatPrice(order.subtotalHalalas, locale)}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt>{t("deliveryFee")}</dt>
              <dd>{formatPrice(order.deliveryFeeHalalas, locale)}</dd>
            </div>
            <div className="flex justify-between gap-6 border-t pt-2">
              <dt>{t("net")}</dt>
              <dd data-testid="invoice-net">
                {formatPrice(netHalalas, locale)}
              </dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt>{t("vat")}</dt>
              <dd data-testid="invoice-vat">
                {formatPrice(order.vatHalalas, locale)}
              </dd>
            </div>
            <div className="flex justify-between gap-6 border-t pt-2 text-base font-bold">
              <dt>{t("total")}</dt>
              <dd data-testid="invoice-total">
                {formatPrice(order.totalHalalas, locale)}
              </dd>
            </div>
            <div className="flex justify-between gap-6 text-muted-foreground">
              <dt>{t("payment")}</dt>
              <dd>{tPay(order.paymentMethod)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <Button asChild size="lg" className="self-center">
        <Link href="/catalog">{t("continue")}</Link>
      </Button>
    </div>
  );
}
