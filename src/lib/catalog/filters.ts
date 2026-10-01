/** Budget buckets for "shop by budget". Bounds are VAT-inclusive halalas; `max` is exclusive. */
export const BUDGETS = {
  "under-200": { min: 0, max: 20_000 },
  "200-400": { min: 20_000, max: 40_000 },
  "400-700": { min: 40_000, max: 70_000 },
  "700-plus": { min: 70_000, max: null },
} as const;

export type BudgetKey = keyof typeof BUDGETS;
export const BUDGET_KEYS = Object.keys(BUDGETS) as BudgetKey[];

export const SORTS = ["newest", "price-asc", "price-desc"] as const;
export type SortKey = (typeof SORTS)[number];
export const DEFAULT_SORT: SortKey = "newest";
