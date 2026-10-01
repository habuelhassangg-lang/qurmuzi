import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CartButton } from "./cart-button";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NAV_LINKS } from "./nav-links";

export function Header() {
  const t = useTranslations("Header");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
        <MobileNav />
        <Logo />
        <nav
          aria-label={t("nav")}
          className="ms-6 hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium hover:bg-accent"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-1">
          <LanguageSwitcher />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
