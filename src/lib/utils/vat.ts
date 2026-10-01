export const VAT_RATE_PERCENT = 15;

export type VatBreakdown = {
  /** Price before VAT, in halalas. */
  net: number;
  /** VAT amount, in halalas. */
  vat: number;
  /** VAT-inclusive price, in halalas (the price customers see). */
  gross: number;
};

/**
 * Splits a VAT-inclusive amount into net + VAT. Works in integer halalas and
 * rounds the VAT, so `net + vat === gross` always holds.
 */
export function splitVat(
  grossHalalas: number,
  ratePercent = VAT_RATE_PERCENT,
): VatBreakdown {
  if (!Number.isInteger(grossHalalas) || grossHalalas < 0) {
    throw new RangeError(
      `Amount must be a non-negative integer of halalas, got ${grossHalalas}`,
    );
  }

  const vat = Math.round((grossHalalas * ratePercent) / (100 + ratePercent));
  return { net: grossHalalas - vat, vat, gross: grossHalalas };
}
