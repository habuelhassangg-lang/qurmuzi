import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils/currency";
import { Section } from "./section";

export function BadgesCardsSection() {
  const t = useTranslations("Styleguide");
  const locale = useLocale();

  return (
    <>
      <Section id="badges" title={t("badges")}>
        <div className="flex flex-wrap gap-2">
          <Badge>{t("badgeNew")}</Badge>
          <Badge variant="secondary">{t("badgeSameDay")}</Badge>
          <Badge variant="outline">{t("sizeLuxury")}</Badge>
        </div>
        <Card className="max-w-sm">
          <div
            className="mx-6 aspect-[4/5] rounded-xl bg-crimson-50"
            aria-hidden
          />
          <CardHeader>
            <CardTitle className="font-display">{t("cardTitle")}</CardTitle>
            <CardDescription>{t("cardBody")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-crimson-600">
              {formatPrice(24900, locale)}
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section id="skeleton" title={t("skeleton")}>
        <div className="flex max-w-sm flex-col gap-3" aria-hidden>
          <Skeleton className="aspect-[4/5] w-full rounded-xl" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
        </div>
      </Section>
    </>
  );
}
