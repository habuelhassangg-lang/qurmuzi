"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Section } from "./section";

export function OverlaysSection() {
  const t = useTranslations("Styleguide");

  return (
    <Section id="overlays" title={t("overlays")}>
      <div className="flex flex-wrap gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">{t("openSheet")}</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{t("sheetTitle")}</SheetTitle>
              <SheetDescription>{t("sheetBody")}</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">{t("openDialog")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dialogTitle")}</DialogTitle>
              <DialogDescription>{t("dialogBody")}</DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton />
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={() => toast.success(t("toastText"))}>
          {t("showToast")}
        </Button>
      </div>
    </Section>
  );
}
