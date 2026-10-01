/** Splits a total into 4 installments; the first absorbs the remainder so the sum is exact. */
export function calculateInstallments(
  totalHalalas: number,
  count = 4,
): number[] {
  if (!Number.isInteger(totalHalalas) || totalHalalas < 0) {
    throw new RangeError(
      `Total must be non-negative integer halalas, got ${totalHalalas}`,
    );
  }
  const base = Math.floor(totalHalalas / count);
  const remainder = totalHalalas - base * count;
  return Array.from({ length: count }, (_, i) =>
    i === 0 ? base + remainder : base,
  );
}
