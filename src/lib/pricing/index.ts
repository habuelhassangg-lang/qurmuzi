/**
 * All money math lives here (CLAUDE.md section 12). Amounts are integer
 * halalas. The same functions run in the browser (for display) and on the
 * server (which always re-prices the order from the database).
 */
import { splitVat } from "@/lib/utils/vat";

export type ItemSelection = {
  variantPriceHalalas: number;
  addOnPricesHalalas: readonly number[];
  quantity?: number;
};

function assertHalalas(amount: number, label = "Prices") {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new RangeError(
      `${label} must be non-negative integer halalas, got ${amount}`,
    );
  }
}

export function calculateItemPrice({
  variantPriceHalalas,
  addOnPricesHalalas,
  quantity = 1,
}: ItemSelection): number {
  for (const amount of [variantPriceHalalas, ...addOnPricesHalalas])
    assertHalalas(amount);
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

export type TotalsInput = {
  lines: readonly ItemSelection[];
  deliveryFeeHalalas: number;
  /** 🪝 Coupons (L5). Always 0 in the MVP. */
  discountHalalas?: number;
};

export type Totals = {
  lines: Array<{ unitHalalas: number; totalHalalas: number }>;
  subtotalHalalas: number;
  deliveryFeeHalalas: number;
  discountHalalas: number;
  /** VAT-inclusive amount the customer pays. */
  totalHalalas: number;
  /** VAT included in `totalHalalas` (15%). */
  vatHalalas: number;
  /** `totalHalalas` before VAT. */
  netHalalas: number;
};

/** Order totals. Prices are VAT-inclusive, so VAT is extracted from the final total. */
export function calculateTotals({
  lines,
  deliveryFeeHalalas,
  discountHalalas = 0,
}: TotalsInput): Totals {
  assertHalalas(deliveryFeeHalalas, "Delivery fee");
  assertHalalas(discountHalalas, "Discount");

  const priced = lines.map((line) => {
    const unitHalalas = calculateItemPrice({ ...line, quantity: 1 });
    return { unitHalalas, totalHalalas: unitHalalas * (line.quantity ?? 1) };
  });
  const subtotalHalalas = priced.reduce(
    (sum, line) => sum + line.totalHalalas,
    0,
  );
  const totalHalalas = Math.max(
    0,
    subtotalHalalas + deliveryFeeHalalas - discountHalalas,
  );
  const { net, vat } = splitVat(totalHalalas);

  return {
    lines: priced,
    subtotalHalalas,
    deliveryFeeHalalas,
    discountHalalas,
    totalHalalas,
    vatHalalas: vat,
    netHalalas: net,
  };
}
