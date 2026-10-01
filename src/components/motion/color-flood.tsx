"use client";

import { useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";
import { gsap, MOTION_QUERIES, useGSAP } from "./gsap";

/**
 * A section that floods from cream to crimson as it scrolls into view.
 * Only transform and opacity animate: a crimson layer scales up from the
 * bottom (scrubbed to scroll), then the content fades in on top of it.
 * Without JS, or with reduced motion, the section is simply crimson.
 * Children should be styled for a crimson background (e.g. `text-cream`).
 */
export function ColorFlood({
  children,
  className,
  ...props
}: ComponentProps<"section">) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "top 30%",
            scrub: true,
          },
        });
        timeline
          .fromTo(
            "[data-flood-layer]",
            { scaleY: 0 },
            { scaleY: 1, ease: "none", duration: 0.7 },
          )
          .fromTo(
            "[data-flood-content]",
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, ease: "none", duration: 0.3 },
          );
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      data-motion="color-flood"
      className={cn("relative isolate overflow-hidden bg-cream", className)}
      {...props}
    >
      <div
        data-flood-layer
        aria-hidden
        className="absolute inset-0 -z-10 origin-bottom bg-crimson-600"
      />
      <div data-flood-content>{children}</div>
    </section>
  );
}
