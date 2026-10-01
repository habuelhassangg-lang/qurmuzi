"use client";

import { useLocale, useTranslations } from "next-intl";
import type { DayAvailability } from "@/lib/delivery/availability";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatHour, riyadhNoon } from "@/lib/utils/dates";

type Props = {
  days: DayAvailability[];
  date: string | undefined;
  slotId: number | undefined;
  onDateChange: (date: string) => void;
  onSlotChange: (slotId: number) => void;
  dateError?: string;
  slotError?: string;
};

const DAY_STATUS_KEY = {
  blackout: "dayBlackout",
  full: "dayFull",
  "past-cutoff": "dayPastCutoff",
} as const;

/** Delivery day (Gregorian + Hijri) and slot. Availability comes from the server. */
export function DateSlotPicker({
  days,
  date,
  slotId,
  onDateChange,
  onSlotChange,
  dateError,
  slotError,
}: Props) {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const selectedDay = days.find((d) => d.date === date);

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex min-w-0 flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">
          {t("deliveryDate")}
        </legend>
        {days.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("noDays")}</p>
        )}
        <div
          role="radiogroup"
          aria-label={t("deliveryDate")}
          aria-describedby={dateError ? "delivery-date-error" : undefined}
          className="-mx-4 flex [scrollbar-width:thin] gap-2 overflow-x-auto px-4 pb-2"
        >
          {days.map((day, index) => {
            const noon = riyadhNoon(day.date);
            const available = day.status === "available";
            const selected = day.date === date;
            const relative =
              index === 0 ? t("today") : index === 1 ? t("tomorrow") : null;
            return (
              <button
                key={day.date}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!available}
                data-date={day.date}
                data-status={day.status}
                onClick={() => onDateChange(day.date)}
                className={cn(
                  "flex min-h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-2 text-center transition-colors disabled:cursor-not-allowed",
                  selected
                    ? "border-crimson-600 bg-crimson-50"
                    : available
                      ? "border-line bg-surface hover:border-crimson-600"
                      : "border-dashed border-line bg-muted text-muted-foreground",
                )}
              >
                <span className="text-xs">
                  {relative ??
                    formatDate(noon, locale, "gregory", { weekday: "short" })}
                </span>
                <span className="text-sm font-semibold">
                  {formatDate(noon, locale, "gregory", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {formatDate(noon, locale, "islamic-umalqura", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                {!available && day.status !== "available" && (
                  <span className="text-[11px] font-medium">
                    {t(DAY_STATUS_KEY[day.status])}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {dateError && (
          <p
            id="delivery-date-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {dateError}
          </p>
        )}
      </fieldset>

      <fieldset className="flex min-w-0 flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">
          {t("deliverySlot")}
        </legend>
        {!selectedDay ? (
          <p className="text-sm text-muted-foreground">{t("chooseDayFirst")}</p>
        ) : (
          <div
            role="radiogroup"
            aria-label={t("deliverySlot")}
            className="grid grid-cols-2 gap-2"
          >
            {selectedDay.slots.map((slot) => {
              const available = slot.status === "available";
              const selected = slot.id === slotId;
              const range = t("slotRange", {
                start: formatHour(Number(slot.startsAt.slice(0, 2)), locale),
                end: formatHour(Number(slot.endsAt.slice(0, 2)), locale),
              });
              return (
                <button
                  key={slot.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!available}
                  data-slot-id={slot.id}
                  data-status={slot.status}
                  onClick={() => onSlotChange(slot.id)}
                  className={cn(
                    "flex min-h-12 cursor-pointer flex-col items-center justify-center rounded-xl border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed",
                    selected
                      ? "border-crimson-600 bg-crimson-50 font-medium"
                      : available
                        ? "border-line bg-surface hover:border-crimson-600"
                        : "border-dashed border-line bg-muted text-muted-foreground",
                  )}
                >
                  <span>{range}</span>
                  {!available && (
                    <span className="text-xs">
                      {t(slot.status === "full" ? "slotFull" : "slotTooSoon")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {slotError && (
          <p role="alert" className="text-sm text-destructive">
            {slotError}
          </p>
        )}
      </fieldset>
    </div>
  );
}
