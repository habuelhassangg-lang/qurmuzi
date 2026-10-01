"use client";

import { useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";
import { gsap, MOTION_QUERIES, useGSAP } from "./gsap";
import { DURATION, EASE, REVEAL_OFFSET } from "./tokens";

type RevealProps = ComponentProps<"div"> & {
  /** Seconds to wait before revealing. */
  delay?: number;
};

/**
 * Fades and lifts its children into view once, when they scroll into the viewport.
 * Reduced motion: content is shown as-is, no movement.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        gsap.from(ref.current, {
          autoAlpha: 0,
          y: REVEAL_OFFSET,
          duration: DURATION.slow,
          delay,
          ease: EASE.out,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} data-motion="reveal" className={cn(className)} {...props}>
      {children}
    </div>
  );
}
