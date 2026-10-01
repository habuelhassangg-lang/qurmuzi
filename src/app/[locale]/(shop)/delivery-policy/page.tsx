import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PolicySection } from "@/components/shop/policy-section";
import { routing } from "@/i18n/routing";
import { getSetting } from "@/lib/db/queries/catalog";
import { listDeliveryZones } from "@/lib/db/queries/checkout";
import { alternatesFor } from "@/lib/site";
import { formatPrice } from "@/lib/utils/currency";
import { formatHour } from "@/lib/utils/dates";

// Zones and fees come from the database; refresh hourly.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/delivery-policy">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "DeliveryPolicy" });
  return {
    title: t("metaTitle"),
    alternates: alternatesFor(locale, "/delivery-policy"),
  };
}

export default async function DeliveryPolicyPage({
  params,
}: PageProps<"/[locale]/delivery-policy">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [t, zones, cutoffHour] = await Promise.all([
    getTranslations("DeliveryPolicy"),
    listDeliveryZones(locale),
    getSetting("same_day_cutoff_hour", 14),
  ]);

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
      <PolicySection id="dp-same-day" title={t("sameDayTitle")}>
        <p>{t("sameDayBody", { hour: formatHour(cutoffHour, locale) })}</p>
      </PolicySection>
      <PolicySection id="dp-slots" title={t("slotsTitle")}>
        <p>{t("slotsBody")}</p>
      </PolicySection>
      <PolicySection id="dp-zones" title={t("zonesTitle")}>
        <div className="grid gap-4 sm:grid-cols-3">
          {zones.map((city) => (
            <table
              key={city.id}
              className="w-full rounded-xl border bg-surface text-sm"
            >
              <caption className="p-3 text-start font-semibold">
                {city.name}
              </caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">{t("district")}</th>
                  <th scope="col">{t("fee")}</th>
                </tr>
              </thead>
              <tbody>
                {city.districts.map((district) => (
                  <tr key={district.id} className="border-t">
                    <th scope="row" className="p-3 text-start font-normal">
                      {district.name}
                    </th>
                    <td className="p-3 text-end">
                      {formatPrice(district.deliveryFeeHalalas, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      </PolicySection>
      <PolicySection id="dp-substitution" title={t("substitutionTitle")}>
        <p>{t("substitutionBody")}</p>
      </PolicySection>
      <PolicySection id="dp-surprise" title={t("surpriseTitle")}>
        <p>{t("surpriseBody")}</p>
      </PolicySection>
    </article>
  );
}
