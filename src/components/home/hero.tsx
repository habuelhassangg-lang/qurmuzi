import { Truck } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type HeroProps = {
  eyebrow: string;
  title: string;
  body: string;
  promise: string;
  cta: string;
  /** The media slot, normally `<HeroMedia />`. */
  media: ReactNode;
};

/** Home hero. No animation here: the image is the LCP element and must paint immediately. */
export function Hero({ eyebrow, title, body, promise, cta, media }: HeroProps) {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 pt-8 pb-12 md:grid-cols-[1.1fr_1fr] md:pt-16">
      <div className="flex flex-col items-start gap-5">
        <p className="font-logo text-lg font-semibold text-crimson-600">
          {eyebrow}
        </p>
        <h1 className="font-display text-4xl leading-tight font-bold text-balance md:text-6xl">
          {title}
        </h1>
        <p className="max-w-prose text-lg text-muted-foreground">{body}</p>
        <p className="flex items-center gap-2 rounded-full bg-crimson-50 px-4 py-2 text-sm font-medium text-crimson-700">
          <Truck className="size-5 shrink-0 rtl:-scale-x-100" aria-hidden />
          {promise}
        </p>
        <Link
          href="/catalog"
          className="inline-flex min-h-12 items-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground hover:bg-crimson-500 active:bg-crimson-700"
        >
          {cta}
        </Link>
      </div>
      <div className="mx-auto w-4/5 max-w-sm md:w-full">{media}</div>
    </section>
  );
}
