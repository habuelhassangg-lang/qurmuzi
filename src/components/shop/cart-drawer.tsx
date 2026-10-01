"use client";

import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/cart/store";
import { CartView } from "./cart-view";

/** Cart drawer, opened from the header bag icon or after adding a product. */
export function CartDrawer() {
  const t = useTranslations("Cart");
  const isOpen = useCart((s) => s.isOpen);
  const setOpen = useCart((s) => s.setOpen);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="w-[90%] gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("deliveryNote")}
          </SheetDescription>
        </SheetHeader>
        {isOpen && <CartView onNavigate={() => setOpen(false)} />}
      </SheetContent>
    </Sheet>
  );
}
