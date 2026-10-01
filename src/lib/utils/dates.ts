import type { Locale } from "@/i18n/routing";

export const SHOP_TIME_ZONE = "Asia/Riyadh";

export type Calendar = "gregory" | "islamic-umalqura";

const DATE_STYLE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

/**
 * Formats a date in Riyadh time with Latin digits. The calendar is always
 * explicit: `ar-SA` would otherwise default to Hijri with Arabic-Indic digits.
 */
export function formatDate(
  date: Date,
  locale: Locale,
  calendar: Calendar = "gregory",
  options: Intl.DateTimeFormatOptions = DATE_STYLE,
): string {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    calendar,
    numberingSystem: "latn",
    timeZone: SHOP_TIME_ZONE,
  }).format(date);
}

/** Gregorian and Hijri (Umm al-Qura) versions of the same date, for display side by side. */
export function formatDualDate(date: Date, locale: Locale) {
  return {
    gregorian: formatDate(date, locale, "gregory"),
    hijri: formatDate(date, locale, "islamic-umalqura"),
  };
}
