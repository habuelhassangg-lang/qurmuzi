import { ColorFlood } from "@/components/motion";
import { Link } from "@/i18n/navigation";

/** Full-bleed crimson band that floods in on scroll (ColorFlood). */
export function BrandFlood({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <ColorFlood>
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-20 text-center text-cream md:py-28">
        <h2 className="font-display text-3xl font-bold text-balance md:text-5xl">
          {title}
        </h2>
        <p className="max-w-prose text-lg text-cream/90">{body}</p>
        <Link
          href="/catalog"
          className="inline-flex min-h-12 items-center rounded-full bg-cream px-8 text-base font-medium text-crimson-700 hover:bg-crimson-50"
        >
          {cta}
        </Link>
      </div>
    </ColorFlood>
  );
}
