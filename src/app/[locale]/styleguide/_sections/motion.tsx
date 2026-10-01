import { useTranslations } from "next-intl";
import { ColorFlood, Reveal, TextReveal } from "@/components/motion";
import { Section } from "./section";

export function MotionSection() {
  const t = useTranslations("Styleguide");

  return (
    <Section id="motion" title={t("motion")}>
      <p className="text-sm text-muted-foreground">{t("motionNote")}</p>
      <TextReveal
        as="p"
        text={t("textRevealSample")}
        className="font-display text-4xl font-bold text-crimson-600"
      />
      <Reveal className="rounded-xl border bg-surface p-6">
        <p>{t("revealSample")}</p>
      </Reveal>
      <ColorFlood className="rounded-xl">
        <div className="flex min-h-64 flex-col justify-center gap-2 px-6 py-12 text-cream">
          <p className="font-display text-3xl font-bold">{t("floodTitle")}</p>
          <p>{t("floodBody")}</p>
        </div>
      </ColorFlood>
    </Section>
  );
}
