/**
 * Delivery availability — pure functions, no I/O. The server feeds in the
 * operational config from the database and the current time; the result
 * decides which dates and slots can be chosen. The browser never decides.
 */
import {
  addDays,
  isoWeekday,
  riyadhDateString,
  riyadhHour,
} from "@/lib/utils/dates";

export type SlotConfig = {
  id: number;
  /** "HH:MM" or "HH:MM:SS", Riyadh time. */
  startsAt: string;
  endsAt: string;
  weekdays: readonly number[];
};

export type CapacityRow = {
  date: string;
  slotId: number;
  capacity: number;
  reserved: number;
};

export type AvailabilityConfig = {
  now: Date;
  /** Same-day orders are accepted only before this Riyadh hour. */
  cutoffHour: number;
  /** Hours needed between ordering and the start of a same-day slot. */
  prepHours: number;
  daysAhead: number;
  slots: readonly SlotConfig[];
  capacity: readonly CapacityRow[];
  blackoutDates: readonly string[];
};

export type SlotStatus = "available" | "full" | "too-soon";
export type DayStatus = "available" | "blackout" | "full" | "past-cutoff";

export type DayAvailability = {
  date: string;
  status: DayStatus;
  slots: Array<{
    id: number;
    startsAt: string;
    endsAt: string;
    status: SlotStatus;
  }>;
};

const hourOf = (time: string) => Number(time.slice(0, 2));

export function computeAvailability(
  config: AvailabilityConfig,
): DayAvailability[] {
  const today = riyadhDateString(config.now);
  const hour = riyadhHour(config.now);
  const blackout = new Set(config.blackoutDates);
  const capacityByKey = new Map(
    config.capacity.map((row) => [`${row.date}|${row.slotId}`, row]),
  );
  const days: DayAvailability[] = [];

  for (let offset = 0; offset < config.daysAhead; offset++) {
    const date = addDays(today, offset);
    const weekday = isoWeekday(date);
    const isToday = offset === 0;

    const slots = config.slots
      .filter((slot) => slot.weekdays.includes(weekday))
      .map((slot) => {
        const row = capacityByKey.get(`${date}|${slot.id}`);
        let status: SlotStatus = "available";
        if (isToday && hourOf(slot.startsAt) < hour + config.prepHours)
          status = "too-soon";
        else if (!row || row.reserved >= row.capacity) status = "full";
        return {
          id: slot.id,
          startsAt: slot.startsAt.slice(0, 5),
          endsAt: slot.endsAt.slice(0, 5),
          status,
        };
      });

    let status: DayStatus = "available";
    if (blackout.has(date)) status = "blackout";
    else if (isToday && hour >= config.cutoffHour) status = "past-cutoff";
    else if (!slots.some((slot) => slot.status === "available")) {
      // Today with only too-soon slots reads as "past the cut-off", not "full".
      status =
        isToday && slots.some((slot) => slot.status === "too-soon")
          ? "past-cutoff"
          : "full";
    }

    days.push({ date, status, slots: status === "available" ? slots : [] });
  }
  return days;
}

/** Server-side check for one date + slot, using the same rules. */
export function isSlotBookable(
  days: readonly DayAvailability[],
  date: string,
  slotId: number,
): boolean {
  const day = days.find((d) => d.date === date);
  return (
    day?.status === "available" &&
    day.slots.some((s) => s.id === slotId && s.status === "available")
  );
}
