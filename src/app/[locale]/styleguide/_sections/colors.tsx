import { useTranslations } from "next-intl";
import {
  BRAND_COLORS,
  CONTRAST_PAIRS,
  type BrandColor,
} from "@/lib/design-tokens";
import { contrastRatio, wcagLevel } from "@/lib/utils/contrast";
import { Badge } from "@/components/ui/badge";
import { Section } from "./section";

// Static class names so Tailwind can see them.
const SWATCH_CLASS: Record<BrandColor, string> = {
  "crimson-700": "bg-crimson-700",
  "crimson-600": "bg-crimson-600",
  "crimson-500": "bg-crimson-500",
  "crimson-50": "bg-crimson-50",
  cream: "bg-cream",
  ink: "bg-ink",
  sage: "bg-sage",
  muted: "bg-muted-foreground",
};

export function ColorsSection() {
  const t = useTranslations("Styleguide");

  return (
    <>
      <Section id="colors" title={t("colors")}>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(Object.keys(BRAND_COLORS) as BrandColor[]).map((name) => (
            <li key={name} className="flex flex-col gap-2">
              <span
                className={`h-16 rounded-xl border ${SWATCH_CLASS[name]}`}
              />
              <code dir="ltr" className="text-start text-sm">
                --{name} {BRAND_COLORS[name]}
              </code>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="contrast" title={t("contrast")}>
        <p className="text-sm text-muted-foreground">{t("contrastNote")}</p>
        <ul className="flex flex-col gap-2">
          {CONTRAST_PAIRS.map(({ fg, bg }) => {
            const ratio = contrastRatio(BRAND_COLORS[fg], BRAND_COLORS[bg]);
            const level = wcagLevel(ratio);
            return (
              <li
                key={`${fg}-${bg}`}
                dir="ltr"
                className="flex items-center justify-between gap-4 rounded-xl border p-3"
              >
                <code className="text-sm">
                  {fg} / {bg}
                </code>
                <span className="flex items-center gap-2">
                  <code className="text-sm">{ratio.toFixed(2)}</code>
                  <Badge
                    variant={
                      level === "fail"
                        ? "destructive"
                        : level === "AA"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {level}
                  </Badge>
                </span>
              </li>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
