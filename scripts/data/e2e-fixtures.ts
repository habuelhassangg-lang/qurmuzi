/**
 * Deterministic delivery fixtures for E2E edge cases, relative to "today" in
 * Riyadh. Seeded only with SEED_E2E_FIXTURES=1 (CI and local E2E runs).
 */
import { addDays } from "../../src/lib/utils/dates";

export const E2E_CAPACITY = 500;

export function e2eFixtureDates(today: string) {
  return {
    /** The earliest slot on this day is fully booked. */
    fullSlotDate: addDays(today, 2),
    /** This day is a blackout date. */
    blackoutDate: addDays(today, 4),
  };
}
