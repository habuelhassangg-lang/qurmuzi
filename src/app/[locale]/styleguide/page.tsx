import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { routing } from "@/i18n/routing";
import { isStyleguideEnabled } from "@/lib/styleguide";
import { BadgesCardsSection } from "./_sections/badges-cards";
import { ButtonsSection } from "./_sections/buttons";
import { CheckoutSection } from "./_sections/checkout";
import { ColorsSection } from "./_sections/colors";
import { FormsSection } from "./_sections/forms";
import { MotionSection } from "./_sections/motion";
import { OverlaysSection } from "./_sections/overlays";
import { ShopSection } from "./_sections/shop";
import { TypographySection } from "./_sections/typography";
import { UtilsSection } from "./_sections/utils";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StyleguidePage({
  params,
}: PageProps<"/[locale]/styleguide">) {
  const { locale } = use(params);
  if (!isStyleguideEnabled() || !hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = useTranslations("Styleguide");

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="font-display text-4xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("intro")}</p>
      <ColorsSection />
      <TypographySection />
      <ButtonsSection />
      <FormsSection />
      <OverlaysSection />
      <BadgesCardsSection />
      <ShopSection />
      <CheckoutSection />
      <UtilsSection />
      <MotionSection />
    </div>
  );
}
