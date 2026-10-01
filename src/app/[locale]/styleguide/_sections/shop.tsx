import { useTranslations } from "next-intl";
import { BudgetShortcuts } from "@/components/home/budget-shortcuts";
import { HeroMedia } from "@/components/home/hero-media";
import { OccasionCard } from "@/components/home/occasion-card";
import {
  ProductCard,
  ProductCardSkeleton,
} from "@/components/shop/product-card";
import { BUDGET_KEYS } from "@/lib/catalog/filters";
import { Section } from "./section";

/** Shop and home components with fixed sample data (no database). */
export function ShopSection() {
  const t = useTranslations("Styleguide");
  const tBudgets = useTranslations("Budgets");
  const tHome = useTranslations("Home");

  return (
    <Section id="shop" title={t("shop")}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <ProductCard
          product={{
            slug: "crimson-classic",
            name: t("cardTitle"),
            fromPriceHalalas: 24900,
            image: {
              path: "/images/products/crimson-classic-1",
              alt: t("cardTitle"),
            },
          }}
        />
        <ProductCardSkeleton />
        <div className="col-span-2 sm:col-span-1">
          <HeroMedia alt={tHome("heroImageAlt")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <OccasionCard
          slug="love"
          name={t("badgeNew")}
          description={t("cardBody")}
        />
        <OccasionCard
          slug="birthday"
          name={t("badgeSameDay")}
          description={null}
        />
      </div>
      <BudgetShortcuts
        budgets={BUDGET_KEYS.map((key) => ({ key, label: tBudgets(key) }))}
      />
    </Section>
  );
}
