"use client";

import { useRef, type ElementType } from "react";
import { cn } from "@/lib/utils/cn";
import { gsap, MOTION_QUERIES, useGSAP } from "./gsap";
import { DURATION, EASE } from "./tokens";

type TextRevealProps = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Seconds between words. */
  stagger?: number;
};

/**
 * Reveals a line word by word as it scrolls into view. Splits on words, never
 * letters, so Arabic letters keep joining. The full text stays in the DOM.
 * Reduced motion: the text is shown as-is.
 */
export function TextReveal({
  text,
  as: Tag = "p",
  className,
  stagger = 0.08,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(/\s+/).filter(Boolean);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        gsap.from("[data-word]", {
          autoAlpha: 0,
          y: "0.4em",
          duration: DURATION.slow,
          ease: EASE.out,
          stagger,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
      });
    },
    { scope: ref, dependencies: [text] },
  );

  return (
    <Tag ref={ref} data-motion="text-reveal" className={cn(className)}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} data-word className="inline-block">
          {word}
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
