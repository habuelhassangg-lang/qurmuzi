"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  MAX_CART_LINES,
  MAX_LINE_QUANTITY,
  type CartLineInput,
} from "@/lib/validation/checkout";

/** A cart line: IDs and choices only. Prices always come from the server. */
export type CartLine = CartLineInput & { key: string };

/** Same product, size and add-ons merge into one line. */
export function lineKey(
  line: Pick<CartLineInput, "variantId" | "addOnIds">,
): string {
  return `${line.variantId}:${[...line.addOnIds].sort((a, b) => a - b).join(",")}`;
}

type CartState = {
  lines: CartLine[];
  hydrated: boolean;
  isOpen: boolean;
  add: (line: CartLineInput) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  /** Drops lines the server no longer recognises. */
  keepOnly: (keys: readonly string[]) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

const clampQuantity = (quantity: number) =>
  Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.round(quantity)));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      hydrated: false,
      isOpen: false,
      add: (line) =>
        set((state) => {
          const key = lineKey(line);
          const existing = state.lines.find((l) => l.key === key);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.key === key
                  ? {
                      ...l,
                      quantity: clampQuantity(l.quantity + line.quantity),
                    }
                  : l,
              ),
            };
          }
          if (state.lines.length >= MAX_CART_LINES) return state;
          return {
            lines: [
              ...state.lines,
              { ...line, quantity: clampQuantity(line.quantity), key },
            ],
          };
        }),
      setQuantity: (key, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.key === key ? { ...l, quantity: clampQuantity(quantity) } : l,
          ),
        })),
      remove: (key) =>
        set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),
      keepOnly: (keys) =>
        set((state) => ({
          lines: state.lines.filter((l) => keys.includes(l.key)),
        })),
      clear: () => set({ lines: [] }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: "qurmuzi-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
      // Rehydrated on the client by <CartHydrator />, so server and first client render match.
      skipHydration: true,
      onRehydrateStorage: () => () => useCart.setState({ hydrated: true }),
    },
  ),
);

export const cartCount = (lines: readonly CartLine[]) =>
  lines.reduce((sum, line) => sum + line.quantity, 0);
