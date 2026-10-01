import { notFound } from "next/navigation";
import { hasLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { routing } from "@/i18n/routing";

export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = useTranslations("Home");
  const common = useTranslations("Common");

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="font-display text-5xl font-bold text-crimson-600">
        {common("brand")}
      </h1>
      <p className="text-lg">{t("tagline")}</p>
    </section>
  );
}
