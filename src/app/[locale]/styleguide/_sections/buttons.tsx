import { ArrowRight, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Section } from "./section";

export function ButtonsSection() {
  const t = useTranslations("Styleguide");

  return (
    <Section id="buttons" title={t("buttons")}>
      <div className="flex flex-wrap gap-3">
        <Button>{t("primary")}</Button>
        <Button variant="secondary">
          <ShoppingBag aria-hidden />
          {t("secondary")}
        </Button>
        <Button variant="outline">
          {t("outline")}
          {/* Directional icons mirror in RTL. */}
          <ArrowRight aria-hidden className="rtl:-scale-x-100" />
        </Button>
        <Button variant="ghost">{t("ghost")}</Button>
        <Button variant="link">{t("link")}</Button>
        <Button disabled>{t("disabled")}</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg">{t("primary")}</Button>
        <Button size="icon" variant="outline" aria-label={t("secondary")}>
          <ShoppingBag aria-hidden />
        </Button>
      </div>
    </Section>
  );
}
