"use client";

import { MotionConfig } from "motion/react";
import { Direction } from "radix-ui";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

/** Client-side providers: RTL direction for Radix, reduced-motion support for Motion, toasts. */
export function Providers({
  dir,
  children,
}: {
  dir: "rtl" | "ltr";
  children: ReactNode;
}) {
  return (
    <Direction.Provider dir={dir}>
      <MotionConfig reducedMotion="user">
        {children}
        <Toaster />
      </MotionConfig>
    </Direction.Provider>
  );
}
