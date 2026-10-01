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

/** Today's calendar date in Riyadh as `YYYY-MM-DD`. Never trust the browser clock for this. */
export function riyadhDateString(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    calendar: "gregory",
    numberingSystem: "latn",
  }).format(now);
}

/** The hour (0–23) in Riyadh right now. */
export function riyadhHour(now: Date = new Date()): number {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: SHOP_TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
    numberingSystem: "latn",
  }).format(now);
  return Number(hour);
}

/** Adds whole days to a `YYYY-MM-DD` string. */
export function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** ISO weekday of a `YYYY-MM-DD` string: 1 = Monday … 5 = Friday, 6 = Saturday, 7 = Sunday. */
export function isoWeekday(dateString: string): number {
  const day = new Date(`${dateString}T00:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

/**
 * A whole hour (0–23) as shop copy: "2 ظهرًا" / "2 PM". Arabic uses a period
 * word instead of ص/م, matching the voice guide.
 */
export function formatHour(hour: number, locale: Locale): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  if (locale === "en") return `${h12} ${hour < 12 ? "AM" : "PM"}`;
  const period =
    hour < 12 ? "صباحًا" : hour < 15 ? "ظهرًا" : hour < 18 ? "عصرًا" : "مساءً";
  return `${h12} ${period}`;
}
