"use client";

import dynamic from "next/dynamic";
import { Direction } from "radix-ui";
import type { ReactNode } from "react";
import { CartHydrator } from "./cart-hydrator";

// The drawer and toasts only matter after interaction, so their code loads
// after the page is interactive instead of in every page's first bundle.
const CartDrawer = dynamic(
  () => import("@/components/shop/cart-drawer").then((m) => m.CartDrawer),
  {
    ssr: false,
  },
);
const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((m) => m.Toaster),
  { ssr: false },
);

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
