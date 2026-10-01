import { cn } from "@/lib/utils/cn";

// Deterministic petal layout (no Math.random, so server and client render the same).
const PETALS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 7) * 0.45,
  duration: 4.5 + (i % 5) * 0.6,
  size: 10 + (i % 4) * 4,
  rotate: (i * 47) % 360,
}));

/**
 * Celebration on the order success page: crimson petals drift down once.
 * CSS only (transform + opacity), decorative, and hidden for reduced motion.
 */
export function FallingPetals({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      data-testid="falling-petals"
      className={cn(
        "pointer-events-none fixed inset-0 z-40 overflow-hidden motion-reduce:hidden",
        className,
      )}
    >
      {PETALS.map((petal, index) => (
        <span
          key={index}
          className="petal absolute -top-8 block rounded-[60%_0_60%_0] bg-crimson-500/80"
          style={{
            insetInlineStart: `${petal.left}%`,
            width: petal.size,
            height: petal.size * 1.3,
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
            rotate: `${petal.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}
