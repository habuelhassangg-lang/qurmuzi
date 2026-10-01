"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "./section";

const labelClass = "text-sm font-medium";

export function FormsSection() {
  const t = useTranslations("Styleguide");

  return (
    <Section id="forms" title={t("forms")}>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="sg-name" className={labelClass}>
            {t("nameLabel")}
          </label>
          <Input
            id="sg-name"
            placeholder={t("namePlaceholder")}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="sg-phone" className={labelClass}>
            {t("phoneLabel")}
          </label>
          <Input
            id="sg-phone"
            type="tel"
            dir="ltr"
            inputMode="tel"
            placeholder="+966 5X XXX XXXX"
            className="text-start"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="sg-city" className={labelClass}>
            {t("cityLabel")}
          </label>
          <Select>
            <SelectTrigger id="sg-city" className="w-full">
              <SelectValue placeholder={t("cityPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="riyadh">{t("riyadh")}</SelectItem>
              <SelectItem value="jeddah">{t("jeddah")}</SelectItem>
              <SelectItem value="dammam">{t("dammam")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 sm:row-span-2">
          <label htmlFor="sg-message" className={labelClass}>
            {t("messageLabel")}
          </label>
          <Textarea id="sg-message" placeholder={t("messagePlaceholder")} />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className={`${labelClass} mb-2`}>{t("sizeLabel")}</legend>
          <RadioGroup defaultValue="regular">
            {(["regular", "large", "luxury"] as const).map((size) => (
              <label
                key={size}
                className="flex min-h-11 cursor-pointer items-center gap-3"
              >
                <RadioGroupItem value={size} />
                {t(
                  size === "regular"
                    ? "sizeRegular"
                    : size === "large"
                      ? "sizeLarge"
                      : "sizeLuxury",
                )}
              </label>
            ))}
          </RadioGroup>
        </fieldset>

        <div className="flex flex-col">
          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <Checkbox defaultChecked />
            {t("hidePrice")}
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <Checkbox />
            {t("surprise")}
          </label>
        </div>
      </div>
    </Section>
  );
}
