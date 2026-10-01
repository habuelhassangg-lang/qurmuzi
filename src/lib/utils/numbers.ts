import type { Locale } from "@/i18n/routing";

/** Formats a plain number with Latin digits in both locales. */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, { numberingSystem: "latn" }).format(
    value,
  );
}
