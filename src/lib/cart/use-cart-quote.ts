"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { quoteCartAction } from "@/app/actions/cart";
import type { QuotedLine } from "@/lib/db/queries/checkout";
import { lineKey, useCart } from "./store";

export type QuotedCartLine = QuotedLine & { key: string };

/**
 * Prices the current cart on the server whenever its contents change.
 * Lines the server drops (no longer available) are removed from the cart.
 */
export function useCartQuote() {
  const lines = useCart((s) => s.lines);
  const hydrated = useCart((s) => s.hydrated);
  const keepOnly = useCart((s) => s.keepOnly);
  const locale = useLocale();
  const [quoted, setQuoted] = useState<QuotedCartLine[] | null>(null);
  const [error, setError] = useState(false);
  const [removedCount, setRemovedCount] = useState(0);
  const [attempt, setAttempt] = useState(0);

  // Quantities don't change prices per unit, so only re-quote when the set of lines changes.
  const signature = useMemo(() => lines.map((l) => l.key).join("|"), [lines]);

  useEffect(() => {
    if (!hydrated) return;
    const items = useCart
      .getState()
      .lines.map(({ productId, variantId, addOnIds, quantity }) => ({
        productId,
        variantId,
        addOnIds,
        quantity,
      }));
    // An empty cart needs no quote; `merged` below handles it.
    if (items.length === 0) return;
    let cancelled = false;
    quoteCartAction({ locale, items })
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setError(true);
          return;
        }
        const withKeys = result.map((line) => ({
          ...line,
          key: lineKey(line),
        }));
        setError(false);
        if (withKeys.length < items.length) {
          setRemovedCount(items.length - withKeys.length);
          keepOnly(withKeys.map((l) => l.key));
        }
        setQuoted(withKeys);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [signature, hydrated, locale, keepOnly, attempt]);

  // Merge live quantities from the store into the quoted lines.
  const merged = useMemo(() => {
    if (lines.length === 0) return [];
    if (!quoted) return null;
    return lines.flatMap((line) => {
      const q = quoted.find((ql) => ql.key === line.key);
      return q ? [{ ...q, quantity: line.quantity }] : [];
    });
  }, [quoted, lines]);

  const retry = () => {
    setError(false);
    setAttempt((n) => n + 1);
  };

  return {
    lines: merged,
    loading: hydrated && merged === null && !error,
    error,
    retry,
    removedCount,
    hydrated,
  };
}
