import { z } from "zod";
import { BUDGET_KEYS, DEFAULT_SORT, SORTS } from "@/lib/catalog/filters";

const slug = z
  .string()
  .regex(/^[a-z0-9-]{1,64}$/)
  .optional()
  .catch(undefined);

/** Catalog filters from URL search params. Invalid values are dropped, never thrown. */
export const catalogFiltersSchema = z.object({
  occasion: slug,
  budget: z.enum(BUDGET_KEYS).optional().catch(undefined),
  sort: z.enum(SORTS).default(DEFAULT_SORT).catch(DEFAULT_SORT),
});

export type CatalogFilters = z.infer<typeof catalogFiltersSchema>;

/** Next.js gives `string | string[] | undefined`; keep the first value. */
export function parseCatalogFilters(
  searchParams: Record<string, string | string[] | undefined>,
): CatalogFilters {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  return catalogFiltersSchema.parse({
    occasion: first(searchParams.occasion),
    budget: first(searchParams.budget),
    sort: first(searchParams.sort),
  });
}

/** Builds a catalog query string, dropping defaults so URLs stay short and shareable. */
export function catalogQuery(
  filters: Partial<CatalogFilters>,
): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.occasion) query.occasion = filters.occasion;
  if (filters.budget) query.budget = filters.budget;
  if (filters.sort && filters.sort !== DEFAULT_SORT) query.sort = filters.sort;
  return query;
}
