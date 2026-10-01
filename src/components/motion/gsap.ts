"use client";

import { useEffect, type RefObject } from "react";

type Gsap = typeof import("gsap").gsap;

/** Pass to `gsap.matchMedia().add()` to branch on the user's motion preference. */
export const MOTION_QUERIES = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;

let gsapPromise: Promise<Gsap> | null = null;

/** Loads GSAP + ScrollTrigger once, on demand, so they never block the first paint. */
function loadGsap(): Promise<Gsap> {
  gsapPromise ??= Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]).then(([{ gsap }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger);
    return gsap;
  });
  return gsapPromise;
}

/** How far ahead of the viewport to start loading an animation. */
const PRELOAD_MARGIN = "50% 0px";

/**
 * Runs a GSAP setup for `ref`, scoped with `gsap.context` and reverted on
 * unmount. GSAP is only downloaded when the element gets near the viewport
 * (CLAUDE.md section 6: lazy-load heavy animations). Until then, and if it
 * never loads, the content is simply visible.
 */
export function useLazyGsap(
  ref: RefObject<HTMLElement | null>,
  setup: (gsap: Gsap) => void,
  dependencies: unknown[] = [],
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let context: ReturnType<Gsap["context"]> | undefined;
    let cancelled = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void loadGsap().then((gsap) => {
          if (cancelled) return;
          context = gsap.context(() => setup(gsap), element);
        });
      },
      { rootMargin: PRELOAD_MARGIN },
    );
    observer.observe(element);

    return () => {
      cancelled = true;
      observer.disconnect();
      context?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setup is re-run only when the caller's dependencies change
  }, dependencies);
}
