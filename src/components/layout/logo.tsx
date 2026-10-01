import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

/** Temporary text logo: "قُرمُزي" set in Alexandria in both locales. */
export function Logo({ className }: { className?: string }) {
  const common = useTranslations("Common");
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex min-h-11 items-center rounded-full font-logo text-2xl font-bold text-crimson-600",
        className,
      )}
    >
      {common("logo")}
    </Link>
  );
}
