import { hasLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { use } from "react";
import { routing } from "@/i18n/routing";

export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = useTranslations("Home");

  return (
    <>
      <p
        role="note"
        className="bg-ink px-4 py-2 text-center text-sm text-cream"
      >
        {t("demoNotice")}
      </p>
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-display text-5xl font-bold text-crimson-600">
          {t("brand")}
        </h1>
        <p className="text-lg">{t("tagline")}</p>
      </main>
    </>
  );
}
