"use client";

import { Direction } from "radix-ui";
import type { ReactNode } from "react";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { Toaster } from "@/components/ui/sonner";
import { CartHydrator } from "./cart-hydrator";

/** Client-side providers: RTL direction for Radix, the cart drawer, and toasts. */
export function Providers({
  dir,
  children,
}: {
  dir: "rtl" | "ltr";
  children: ReactNode;
}) {
  return (
    <Direction.Provider dir={dir}>
      {children}
      <CartHydrator />
      <CartDrawer />
      <Toaster />
    </Direction.Provider>
  );
}
