import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

export type Chip = {
  key: string;
  label: string;
  query: Record<string, string>;
  active: boolean;
};

/**
 * A row of filter links. Filters are plain links to URLs, so every filtered
 * view is shareable and works without JavaScript.
 */
export function FilterChips({
  label,
  chips,
}: {
  label: string;
  chips: Chip[];
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <ul className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1">
        {chips.map((chip) => (
          <li key={chip.key} className="shrink-0">
            <Link
              href={{ pathname: "/catalog", query: chip.query }}
              aria-current={chip.active ? "true" : undefined}
              scroll={false}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-4 text-sm whitespace-nowrap transition-colors",
                chip.active
                  ? "border-crimson-600 bg-crimson-600 text-cream"
                  : "border-line bg-surface hover:border-crimson-600",
              )}
            >
              {chip.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
