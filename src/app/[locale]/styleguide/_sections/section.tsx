import type { ReactNode } from "react";

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="flex scroll-mt-20 flex-col gap-4 border-t py-8"
    >
      <h2 id={id} className="font-display text-2xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}
