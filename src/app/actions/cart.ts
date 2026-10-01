"use server";

import { z } from "zod";
import { routing } from "@/i18n/routing";
import { quoteLines, type QuotedLine } from "@/lib/db/queries/checkout";
import { cartLineSchema, MAX_CART_LINES } from "@/lib/validation/checkout";

const quoteInput = z.object({
  locale: z.enum(routing.locales),
  items: z.array(cartLineSchema).max(MAX_CART_LINES),
});

/** Prices cart lines from the database for display. Invalid lines are dropped. */
export async function quoteCartAction(
  input: unknown,
): Promise<QuotedLine[] | null> {
  const parsed = quoteInput.safeParse(input);
  if (!parsed.success) return null;
  return quoteLines(parsed.data.items, parsed.data.locale);
}
