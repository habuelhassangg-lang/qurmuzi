/** Saudi National Address short code: 4 letters + 4 digits, e.g. "RRRD2929". */
export function normalizeNationalAddressCode(input: string): string | null {
  const code = input.replace(/\s/g, "").toUpperCase();
  return /^[A-Z]{4}\d{4}$/.test(code) ? code : null;
}
