"use client";

import { Direction } from "radix-ui";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

/** Client-side providers: RTL direction for Radix, and toasts. */
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
      <Toaster />
    </Direction.Provider>
  );
}
