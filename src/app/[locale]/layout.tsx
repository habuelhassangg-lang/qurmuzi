import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DemoNotice } from "@/components/layout/demo-notice";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Providers } from "@/components/layout/providers";
import { SkipLink } from "@/components/layout/skip-link";
import { localeDirection, routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { alternatesFor, SITE_URL } from "@/lib/site";
import "../globals.css";

// Pages render on first visit and are then cached (on-demand ISR), so
// `next build` never needs the database. See the decisions log in CLAUDE.md.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: `%s | ${t("siteName")}` },
    description: t("description"),
    alternates: alternatesFor(locale),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const dir = localeDirection[locale];

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <Providers dir={dir}>
            <SkipLink />
            <DemoNotice />
            <Header />
            <main
              id="main"
              tabIndex={-1}
              className="flex flex-1 flex-col outline-none"
            >
              {children}
            </main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
