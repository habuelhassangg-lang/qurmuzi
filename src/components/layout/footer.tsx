import { useTranslations } from "next-intl";
import { Logo } from "./logo";

export function Footer() {
  const t = useTranslations("Footer");
  const year = String(new Date().getFullYear());

  return (
    <footer className="mt-auto border-t bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8">
        <Logo />
        <p className="text-sm">{t("tagline")}</p>
        <p className="text-sm text-muted-foreground">{t("demo")}</p>
        <p className="text-sm text-muted-foreground">{t("rights", { year })}</p>
      </div>
    </footer>
  );
}
