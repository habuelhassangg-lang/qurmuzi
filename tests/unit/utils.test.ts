import { describe, expect, it } from "vitest";
import { contrastRatio, wcagLevel } from "@/lib/utils/contrast";
import { formatPrice } from "@/lib/utils/currency";
import { formatDate, formatDualDate } from "@/lib/utils/dates";
import {
  formatSaudiMobile,
  isValidSaudiMobile,
  normalizeSaudiMobile,
} from "@/lib/utils/phone";
import { splitVat } from "@/lib/utils/vat";

const ARABIC_INDIC = /[٠-٩۰-۹]/;

describe("formatPrice", () => {
  it("formats whole riyals without decimals", () => {
    expect(formatPrice(14900, "ar")).toBe("149 ر.س");
    expect(formatPrice(14900, "en")).toBe("SAR 149");
  });

  it("keeps two decimals for partial riyals", () => {
    expect(formatPrice(14950, "ar")).toBe("149.50 ر.س");
    expect(formatPrice(5, "en")).toBe("SAR 0.05");
  });

  it("groups thousands with Latin digits in both locales", () => {
    expect(formatPrice(125000, "ar")).toBe("1,250 ر.س");
    expect(formatPrice(125000, "en")).toBe("SAR 1,250");
    expect(formatPrice(123456789, "ar")).not.toMatch(ARABIC_INDIC);
  });

  it("rejects non-integer halalas", () => {
    expect(() => formatPrice(10.5, "ar")).toThrow(TypeError);
  });
});

describe("splitVat", () => {
  it("splits a VAT-inclusive price at 15%", () => {
    expect(splitVat(11500)).toEqual({ net: 10000, vat: 1500, gross: 11500 });
  });

  it("never loses a halala to rounding", () => {
    for (const gross of [0, 1, 99, 14900, 19999, 34567, 1000001]) {
      const { net, vat } = splitVat(gross);
      expect(net + vat).toBe(gross);
      expect(Number.isInteger(net) && Number.isInteger(vat)).toBe(true);
    }
  });

  it("rounds VAT to the nearest halala", () => {
    // 149 SAR: VAT = 14900 * 15 / 115 = 1943.48 → 1943
    expect(splitVat(14900)).toEqual({ net: 12957, vat: 1943, gross: 14900 });
  });

  it("rejects negative or fractional amounts", () => {
    expect(() => splitVat(-1)).toThrow(RangeError);
    expect(() => splitVat(1.5)).toThrow(RangeError);
  });
});

describe("formatDate", () => {
  // 2026-09-22T22:30:00Z is already 23 September (National Day) in Riyadh (UTC+3).
  const nationalDay = new Date("2026-09-22T22:30:00Z");

  it("uses Riyadh time, not UTC", () => {
    expect(formatDate(nationalDay, "en")).toBe("September 23, 2026");
  });

  it("uses the Gregorian calendar with Latin digits in Arabic by default", () => {
    const formatted = formatDate(nationalDay, "ar");
    expect(formatted).toContain("سبتمبر");
    expect(formatted).toContain("2026");
    expect(formatted).not.toMatch(ARABIC_INDIC);
  });

  it("formats Hijri dates with the Umm al-Qura calendar", () => {
    const { gregorian, hijri } = formatDualDate(nationalDay, "ar");
    expect(gregorian).toContain("2026");
    expect(hijri).toContain("1448");
    expect(hijri).not.toMatch(ARABIC_INDIC);
  });
});

describe("Saudi mobile numbers", () => {
  it.each([
    "0501234567",
    "501234567",
    "+966501234567",
    "00966501234567",
    "966501234567",
    "+966 50 123 4567",
    "050-123-4567",
    "٠٥٠١٢٣٤٥٦٧",
  ])("normalizes %s", (input) => {
    expect(normalizeSaudiMobile(input)).toBe("+966501234567");
  });

  it.each(["", "0401234567", "05012345", "+97150123456", "05012345678", "abc"])(
    "rejects %s",
    (input) => {
      expect(normalizeSaudiMobile(input)).toBeNull();
      expect(isValidSaudiMobile(input)).toBe(false);
    },
  );

  it("formats for display", () => {
    expect(formatSaudiMobile("0501234567")).toBe("+966 50 123 4567");
  });

  it("leaves invalid input unchanged when formatting", () => {
    expect(formatSaudiMobile("123")).toBe("123");
  });
});

describe("contrast", () => {
  it("matches known WCAG ratios", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });

  it("classifies ratios", () => {
    expect(wcagLevel(7)).toBe("AA");
    expect(wcagLevel(3.2)).toBe("AA large");
    expect(wcagLevel(2)).toBe("fail");
  });

  it("brand text colors pass AA on cream", () => {
    expect(contrastRatio("#1f2a24", "#fbf8f4")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#9e1b32", "#fbf8f4")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#6b7280", "#fbf8f4")).toBeGreaterThanOrEqual(4.5);
  });
});
