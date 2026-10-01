/** Shared motion timings (seconds). Purchase-path animations must stay ≤ 0.3s. */
export const DURATION = {
  fast: 0.2,
  base: 0.3,
  slow: 0.6,
} as const;

export const EASE = {
  out: "power2.out",
  inOut: "power2.inOut",
} as const;

/** Distance (px) that revealed elements travel. */
export const REVEAL_OFFSET = 24;
