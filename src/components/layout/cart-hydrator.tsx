"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart/store";

/** Reads the saved cart from localStorage after the first render. */
export function CartHydrator() {
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);
  return null;
}
