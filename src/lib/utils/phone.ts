const COUNTRY_CODE = "966";

// Saudi mobile numbers: 5 followed by 8 digits.
const NATIONAL_MOBILE = /^5\d{8}$/;

/** Converts Arabic-Indic (٠-٩) and Eastern Arabic-Indic (۰-۹) digits to Latin. */
function toLatinDigits(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

/**
 * Normalizes any common way of typing a Saudi mobile number to `+9665XXXXXXXX`.
 * Accepts 05…, 5…, +9665…, 009665… and 9665…, with spaces, dashes or Arabic digits.
 * Returns `null` when the input is not a Saudi mobile number.
 */
export function normalizeSaudiMobile(input: string): string | null {
  let digits = toLatinDigits(input).replace(/[\s\-().]/g, "");

  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);

  if (digits.startsWith(COUNTRY_CODE))
    digits = digits.slice(COUNTRY_CODE.length);
  else if (digits.startsWith("0")) digits = digits.slice(1);

  return NATIONAL_MOBILE.test(digits) ? `+${COUNTRY_CODE}${digits}` : null;
}

export function isValidSaudiMobile(input: string): boolean {
  return normalizeSaudiMobile(input) !== null;
}

/** Formats a mobile number for display: `+966 5X XXX XXXX`. Returns the input unchanged if invalid. */
export function formatSaudiMobile(input: string): string {
  const normalized = normalizeSaudiMobile(input);
  if (!normalized) return input;
  const n = normalized.slice(1 + COUNTRY_CODE.length);
  return `+${COUNTRY_CODE} ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}`;
}
