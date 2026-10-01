import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckoutForm } from "@/components/shop/checkout/checkout-form";
import { routing } from "@/i18n/routing";
import { getNow } from "@/lib/clock";
import {
  getAvailability,
  getCheckoutSettings,
  listDeliveryZones,
} from "@/lib/db/queries/checkout";

// Availability depends on the current time and capacity, so render per request.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/checkout">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Checkout" });
  return { title: t("title"), robots: { index: false } };
}

export default async function CheckoutPage({
  params,
}: PageProps<"/[locale]/checkout">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const settings = await getCheckoutSettings();
  const [t, zones, availability] = await Promise.all([
    getTranslations("Checkout"),
    listDeliveryZones(locale),
    getAvailability(await getNow(), settings),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-bold">{t("title")}</h1>
      <CheckoutForm
        zones={zones}
        availability={availability}
        giftMessageMaxLength={settings.giftMessageMaxLength}
      />
    </div>
  );
}
