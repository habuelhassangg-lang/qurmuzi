/**
 * Card checks for the mock mada form. They run in the browser only: card
 * data is never sent to the server or stored (CLAUDE.md section 7).
 */

/** A Luhn-valid test card with a mada BIN, prefilled in the demo form. */
export const TEST_CARD = {
  number: "4464 0400 0000 0007",
  expiry: "12/30",
  cvv: "123",
  name: "Demo Customer",
} as const;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidLuhn(cardNumber: string): boolean {
  const digits = digitsOnly(cardNumber);
  if (digits.length < 12 || digits.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/** `MM/YY`, not in the past (compared by month). */
export function isValidExpiry(expiry: string, now: Date = new Date()): boolean {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(expiry.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const thisMonth = now.getUTCFullYear() * 12 + now.getUTCMonth();
  return year * 12 + (month - 1) >= thisMonth;
}

export function isValidCvv(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv.trim());
}

/** Groups digits in fours for display: "4464 0400 0000 0007". */
export function formatCardNumber(value: string): string {
  return digitsOnly(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}
