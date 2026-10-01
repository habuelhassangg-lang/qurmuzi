import { useTranslations } from "next-intl";

/** The persistent "demo site" bar — the only announcement bar allowed in the MVP. */
export function DemoNotice() {
  const t = useTranslations("DemoNotice");
  return (
    <p role="note" className="bg-ink px-4 py-2 text-center text-sm text-cream">
      {t("text")}
    </p>
  );
}
