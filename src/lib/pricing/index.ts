/**
 * Money math lives here. M2 only needs the price of one configured item
 * (size + add-ons); M4 adds `calculateTotals()` for the whole order on top of it.
 * All amounts are integer halalas.
 */

export type ItemSelection = {
  variantPriceHalalas: number;
  addOnPricesHalalas: readonly number[];
  quantity?: number;
};

export function calculateItemPrice({
  variantPriceHalalas,
  addOnPricesHalalas,
  quantity = 1,
}: ItemSelection): number {
  for (const amount of [variantPriceHalalas, ...addOnPricesHalalas]) {
    if (!Number.isInteger(amount) || amount < 0) {
      throw new RangeError(
        `Prices must be non-negative integer halalas, got ${amount}`,
      );
    }
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new RangeError(
      `Quantity must be a positive integer, got ${quantity}`,
    );
  }
  const unit = addOnPricesHalalas.reduce(
    (sum, price) => sum + price,
    variantPriceHalalas,
  );
  return unit * quantity;
}
