import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils/currency";
import { formatDualDate } from "@/lib/utils/dates";
import { formatSaudiMobile } from "@/lib/utils/phone";
import { splitVat } from "@/lib/utils/vat";
import { Section } from "./section";

// Fixed sample values so screenshots stay stable.
const SAMPLE_PRICE = 34950;
const SAMPLE_DATE = new Date("2026-09-23T09:00:00Z");
const SAMPLE_PHONE = "0501234567";

export function UtilsSection() {
  const t = useTranslations("Styleguide");
  const locale = useLocale();
  const vat = splitVat(SAMPLE_PRICE);
  const date = formatDualDate(SAMPLE_DATE, locale);

  const rows: Array<[string, string]> = [
    [t("price"), formatPrice(SAMPLE_PRICE, locale)],
    [t("vatNet"), formatPrice(vat.net, locale)],
    [t("vatAmount"), formatPrice(vat.vat, locale)],
    [t("vatGross"), formatPrice(vat.gross, locale)],
    [t("date"), `${date.gregorian} · ${date.hijri}`],
    [t("phone"), formatSaudiMobile(SAMPLE_PHONE)],
  ];

  return (
    <Section id="utils" title={t("utils")}>
      <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">
              {/* Phone numbers always read left to right. */}
              {label === t("phone") ? <bdi dir="ltr">{value}</bdi> : value}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
