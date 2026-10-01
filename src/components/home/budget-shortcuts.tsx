import { Link } from "@/i18n/navigation";
import type { BudgetKey } from "@/lib/catalog/filters";

/** Budget shortcuts: shop by budget first (CLAUDE.md section 9). */
export function BudgetShortcuts({
  budgets,
}: {
  budgets: Array<{ key: BudgetKey; label: string }>;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {budgets.map((budget) => (
        <li key={budget.key}>
          <Link
            href={{ pathname: "/catalog", query: { budget: budget.key } }}
            className="flex min-h-16 items-center justify-center rounded-xl border bg-surface px-3 text-center font-medium transition-colors hover:border-crimson-600 hover:bg-crimson-50"
          >
            {budget.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
