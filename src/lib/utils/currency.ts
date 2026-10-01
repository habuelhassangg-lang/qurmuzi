import type { Locale } from "@/i18n/routing";

export const HALALAS_PER_RIYAL = 100;

const CURRENCY_LABEL: Record<Locale, string> = {
  ar: "ر.س",
  en: "SAR",
};

/**
 * Formats an integer amount of halalas as a SAR price with Latin digits.
 * Whole riyals drop the decimals ("149 ر.س"); otherwise two decimals ("149.50 ر.س").
 */
export function formatPrice(halalas: number, locale: Locale): string {
  if (!Number.isInteger(halalas)) {
    throw new TypeError(
      `Price must be an integer number of halalas, got ${halalas}`,
    );
  }

  const whole = halalas % HALALAS_PER_RIYAL === 0;
  const amount = new Intl.NumberFormat(locale, {
    numberingSystem: "latn",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(halalas / HALALAS_PER_RIYAL);

  return locale === "ar"
    ? `${amount} ${CURRENCY_LABEL.ar}`
    : `${CURRENCY_LABEL.en} ${amount}`;
}
