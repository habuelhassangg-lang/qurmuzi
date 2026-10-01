import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "./logo";

export function Footer() {
  const t = useTranslations("Footer");
  const year = String(new Date().getFullYear());

  return (
    <footer className="mt-auto border-t bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-sm">{t("tagline")}</p>
          <p className="text-sm text-muted-foreground">{t("demo")}</p>
          <p className="text-sm text-muted-foreground">
            {t("rights", { year })}
          </p>
        </div>
        <nav aria-label={t("links")}>
          <ul className="flex flex-col gap-1 text-sm">
            <li>
              <Link
                href="/delivery-policy"
                className="inline-flex min-h-11 items-center hover:text-crimson-600"
              >
                {t("deliveryPolicy")}
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="inline-flex min-h-11 items-center hover:text-crimson-600"
              >
                {t("privacy")}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
