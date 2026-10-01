import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PolicySection } from "@/components/shop/policy-section";
import { routing } from "@/i18n/routing";
import { alternatesFor } from "@/lib/site";
import { formatDate, riyadhNoon } from "@/lib/utils/dates";

const LAST_UPDATED = "2026-10-01";
const SECTIONS = [
  "demo",
  "collect",
  "notCollect",
  "use",
  "cookies",
  "retention",
  "rights",
  "contact",
] as const;

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return {
    title: t("metaTitle"),
    alternates: alternatesFor(locale, "/privacy"),
  };
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("Privacy");

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("updated", { date: formatDate(riyadhNoon(LAST_UPDATED), locale) })}
        </p>
      </header>
      {SECTIONS.map((key) => (
        <PolicySection key={key} id={`privacy-${key}`} title={t(`${key}Title`)}>
          <p>{t(`${key}Body`)}</p>
        </PolicySection>
      ))}
    </article>
  );
}
