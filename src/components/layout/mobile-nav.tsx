"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { NAV_LINKS } from "./nav-links";

export function MobileNav() {
  const t = useTranslations("Header");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={t("menu")}
        >
          <Menu aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="start">
        <SheetHeader>
          <SheetTitle>{t("menu")}</SheetTitle>
        </SheetHeader>
        <nav aria-label={t("nav")} className="flex flex-col px-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="flex min-h-12 items-center rounded-md px-3 text-lg hover:bg-accent"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
