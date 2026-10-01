import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";

/** Links to the catalog filtered by one occasion. */
export function OccasionCard({
  slug,
  name,
  description,
}: {
  slug: string;
  name: string;
  description: string | null;
}) {
  return (
    <Link
      href={{ pathname: "/catalog", query: { occasion: slug } }}
      className="group flex h-full min-h-32 flex-col justify-between gap-3 rounded-xl border bg-surface p-4 transition-colors hover:border-crimson-600 hover:bg-crimson-50"
    >
      <span className="flex flex-col gap-1">
        <span className="font-display text-lg font-semibold">{name}</span>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </span>
      {/* Points toward reading direction: left in Arabic, right in English. */}
      <ArrowLeft
        aria-hidden
        className="size-5 self-end text-crimson-600 transition-transform group-hover:-translate-x-1 motion-reduce:transition-none ltr:-scale-x-100 ltr:group-hover:translate-x-1"
      />
    </Link>
  );
}
