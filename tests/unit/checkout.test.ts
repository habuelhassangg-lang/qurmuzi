import { describe, expect, it } from "vitest";
import {
  computeAvailability,
  isSlotBookable,
  type AvailabilityConfig,
} from "@/lib/delivery/availability";
import { decodeZatcaTlv, encodeZatcaTlv } from "@/lib/invoice/zatca";
import {
  formatCardNumber,
  isValidCvv,
  isValidExpiry,
  isValidLuhn,
  TEST_CARD,
} from "@/lib/payments/card";
import { calculateInstallments } from "@/lib/payments/installments";
import { calculateTotals } from "@/lib/pricing";
import { normalizeNationalAddressCode } from "@/lib/utils/address";

describe("calculateTotals", () => {
  it("sums lines, add-ons, quantity and delivery, and extracts 15% VAT", () => {
    const totals = calculateTotals({
      lines: [
        { variantPriceHalalas: 34900, addOnPricesHalalas: [5900], quantity: 1 },
        { variantPriceHalalas: 14900, addOnPricesHalalas: [], quantity: 2 },
      ],
      deliveryFeeHalalas: 2500,
    });
    expect(totals.lines).toEqual([
      { unitHalalas: 40800, totalHalalas: 40800 },
      { unitHalalas: 14900, totalHalalas: 29800 },
    ]);
    expect(totals.subtotalHalalas).toBe(70600);
    expect(totals.totalHalalas).toBe(73100);
    expect(totals.vatHalalas + totals.netHalalas).toBe(73100);
    expect(totals.vatHalalas).toBe(Math.round((73100 * 15) / 115));
    expect(totals.discountHalalas).toBe(0);
  });

  it("applies a discount hook without going below zero", () => {
    expect(
      calculateTotals({
        lines: [],
        deliveryFeeHalalas: 0,
        discountHalalas: 500,
      }).totalHalalas,
    ).toBe(0);
    expect(
      calculateTotals({
        lines: [{ variantPriceHalalas: 10000, addOnPricesHalalas: [] }],
        deliveryFeeHalalas: 0,
        discountHalalas: 1000,
      }).totalHalalas,
    ).toBe(9000);
  });

  it("rejects fractional amounts", () => {
    expect(() =>
      calculateTotals({ lines: [], deliveryFeeHalalas: 25.5 }),
    ).toThrow(RangeError);
  });
});

describe("computeAvailability", () => {
  // Thursday 1 Oct 2026; tomorrow is a Friday.
  const at = (hour: number) =>
    new Date(`2026-10-01T${String(hour).padStart(2, "0")}:00:00+03:00`);
  const slots = [
    {
      id: 1,
      startsAt: "09:00:00",
      endsAt: "12:00:00",
      weekdays: [1, 2, 3, 4, 6, 7],
    },
    {
      id: 2,
      startsAt: "15:00:00",
      endsAt: "18:00:00",
      weekdays: [1, 2, 3, 4, 5, 6, 7],
    },
    {
      id: 3,
      startsAt: "18:00:00",
      endsAt: "21:00:00",
      weekdays: [1, 2, 3, 4, 5, 6, 7],
    },
  ];
  const dates = ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"];
  const capacity = dates.flatMap((date) =>
    slots.map((s) => ({ date, slotId: s.id, capacity: 5, reserved: 0 })),
  );
  const base: AvailabilityConfig = {
    now: at(10),
    cutoffHour: 14,
    prepHours: 2,
    daysAhead: 4,
    slots,
    capacity,
    blackoutDates: [],
  };

  it("offers same-day slots that start after the prep time, before the cut-off", () => {
    const [today] = computeAvailability(base);
    expect(today.status).toBe("available");
    expect(today.slots.map((s) => [s.id, s.status])).toEqual([
      [1, "too-soon"],
      [2, "available"],
      [3, "available"],
    ]);
  });

  it("closes today after the cut-off, in Riyadh time", () => {
    const [today, tomorrow] = computeAvailability({ ...base, now: at(15) });
    expect(today).toEqual({
      date: "2026-10-01",
      status: "past-cutoff",
      slots: [],
    });
    expect(tomorrow.status).toBe("available");
  });

  it("only offers Friday slots configured for Friday", () => {
    const friday = computeAvailability(base)[1];
    expect(friday.date).toBe("2026-10-02");
    expect(friday.slots.map((s) => s.id)).toEqual([2, 3]);
  });

  it("marks full slots and fully booked days", () => {
    const full = capacity.map((row) =>
      row.date === "2026-10-03"
        ? { ...row, reserved: row.slotId === 1 ? 5 : row.reserved }
        : row,
    );
    const saturday = computeAvailability({ ...base, capacity: full })[2];
    expect(saturday.slots.find((s) => s.id === 1)?.status).toBe("full");
    expect(saturday.status).toBe("available");

    const allFull = capacity.map((row) =>
      row.date === "2026-10-03" ? { ...row, reserved: 5 } : row,
    );
    expect(computeAvailability({ ...base, capacity: allFull })[2].status).toBe(
      "full",
    );
  });

  it("treats days without capacity rows as full", () => {
    const days = computeAvailability({ ...base, capacity: [] });
    expect(days.every((d) => d.status !== "available")).toBe(true);
  });

  it("blocks blackout dates", () => {
    const days = computeAvailability({
      ...base,
      blackoutDates: ["2026-10-04"],
    });
    expect(days[3]).toEqual({
      date: "2026-10-04",
      status: "blackout",
      slots: [],
    });
  });

  it("isSlotBookable agrees with the computed availability", () => {
    const days = computeAvailability({ ...base, now: at(15) });
    expect(isSlotBookable(days, "2026-10-01", 2)).toBe(false);
    expect(isSlotBookable(days, "2026-10-02", 1)).toBe(false);
    expect(isSlotBookable(days, "2026-10-02", 2)).toBe(true);
    expect(isSlotBookable(days, "2030-01-01", 2)).toBe(false);
  });
});

describe("card checks (browser only)", () => {
  it("accepts the prefilled test card", () => {
    expect(isValidLuhn(TEST_CARD.number)).toBe(true);
    expect(isValidExpiry(TEST_CARD.expiry, new Date("2026-10-01"))).toBe(true);
    expect(isValidCvv(TEST_CARD.cvv)).toBe(true);
  });

  it("rejects bad numbers, past expiry and bad CVV", () => {
    expect(isValidLuhn("4464 0400 0000 0008")).toBe(false);
    expect(isValidLuhn("1234")).toBe(false);
    expect(isValidExpiry("09/26", new Date("2026-10-01"))).toBe(false);
    expect(isValidExpiry("10/26", new Date("2026-10-15"))).toBe(true);
    expect(isValidExpiry("13/30")).toBe(false);
    expect(isValidCvv("12")).toBe(false);
  });

  it("formats card numbers in groups of four", () => {
    expect(formatCardNumber("4464040000000007")).toBe("4464 0400 0000 0007");
  });
});

describe("installments", () => {
  it("splits into 4 parts that add up exactly", () => {
    expect(calculateInstallments(43300)).toEqual([10825, 10825, 10825, 10825]);
    const parts = calculateInstallments(10001);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(10001);
    expect(parts).toEqual([2501, 2500, 2500, 2500]);
  });
});

describe("ZATCA TLV", () => {
  it("round-trips all five fields, including Arabic text", () => {
    const encoded = encodeZatcaTlv({
      sellerName: "قُرمُزي",
      vatNumber: "300000000000003",
      timestamp: new Date("2026-10-01T10:00:00Z"),
      totalWithVat: "433.00",
      vatAmount: "56.48",
    });
    expect(decodeZatcaTlv(encoded)).toEqual({
      1: "قُرمُزي",
      2: "300000000000003",
      3: "2026-10-01T10:00:00.000Z",
      4: "433.00",
      5: "56.48",
    });
  });
});

describe("national address", () => {
  it("normalizes valid short codes and rejects others", () => {
    expect(normalizeNationalAddressCode("rrrd 2929")).toBe("RRRD2929");
    expect(normalizeNationalAddressCode("RRR2929")).toBeNull();
  });
});
