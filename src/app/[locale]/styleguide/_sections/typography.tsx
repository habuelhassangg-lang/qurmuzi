import { useTranslations } from "next-intl";
import { Section } from "./section";

export function TypographySection() {
  const t = useTranslations("Styleguide");
  const common = useTranslations("Common");

  return (
    <Section id="typography" title={t("typography")}>
      <p className="font-logo text-5xl font-bold text-crimson-600">
        {common("logo")}
      </p>
      <p className="font-display text-4xl font-bold">{t("displaySample")}</p>
      <p className="font-display text-2xl font-semibold">
        {t("displaySample")}
      </p>
      <p className="text-base">{t("bodySample")}</p>
      <p className="text-sm text-muted-foreground">{t("bodySample")}</p>
    </Section>
  );
}
