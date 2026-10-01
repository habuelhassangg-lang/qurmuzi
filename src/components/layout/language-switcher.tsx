"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

/** Links to the same page in the other locale. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();
  const target = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href={pathname}
      locale={target}
      hrefLang={target}
      lang={target}
      aria-label={t("switchLanguageLabel")}
      className={cn(
        "inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium hover:bg-accent",
        className,
      )}
    >
      {t("switchLanguage")}
    </Link>
  );
}
