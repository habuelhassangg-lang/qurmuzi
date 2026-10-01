import type { ReactNode } from "react";

/** A titled block of text on the short policy pages. */
export function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h2 id={id} className="font-display text-xl font-semibold">
        {title}
      </h2>
      <div className="leading-relaxed text-ink">{children}</div>
    </section>
  );
}
