import { useTranslations } from "next-intl";

/** First focusable element on every page: jumps keyboard users past the header. */
export function SkipLink() {
  const t = useTranslations("Common");
  return (
    <a
      href="#main"
      className="sr-only rounded-full bg-ink px-4 py-3 text-cream focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50"
    >
      {t("skipToContent")}
    </a>
  );
}
