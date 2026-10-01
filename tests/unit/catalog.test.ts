import { afterEach, describe, expect, it, vi } from "vitest";
import { variantPrices } from "../../scripts/data/catalog";
import { getConsent, setConsent, track } from "@/lib/analytics";
import { calculateItemPrice } from "@/lib/pricing";
import { alternatesFor, SITE_URL } from "@/lib/site";
import {
  addDays,
  formatHour,
  isoWeekday,
  riyadhDateString,
  riyadhHour,
} from "@/lib/utils/dates";
import { catalogQuery, parseCatalogFilters } from "@/lib/validation/catalog";

describe("parseCatalogFilters", () => {
  it("defaults to newest with no filters", () => {
    expect(parseCatalogFilters({})).toEqual({
      occasion: undefined,
      budget: undefined,
      sort: "newest",
    });
  });

  it("accepts valid values", () => {
    expect(
      parseCatalogFilters({
        occasion: "new-baby",
        budget: "200-400",
        sort: "price-asc",
      }),
    ).toEqual({
      occasion: "new-baby",
      budget: "200-400",
      sort: "price-asc",
    });
  });

  it("drops invalid values instead of throwing", () => {
    expect(
      parseCatalogFilters({
        occasion: "<script>",
        budget: "free",
        sort: "random",
      }),
    ).toEqual({
      occasion: undefined,
      budget: undefined,
      sort: "newest",
    });
  });

  it("uses the first value of repeated params", () => {
    expect(
      parseCatalogFilters({ budget: ["under-200", "700-plus"] }).budget,
    ).toBe("under-200");
  });
});

describe("catalogQuery", () => {
  it("omits defaults and empty filters", () => {
    expect(catalogQuery({ sort: "newest" })).toEqual({});
    expect(
      catalogQuery({ occasion: "love", budget: undefined, sort: "price-desc" }),
    ).toEqual({
      occasion: "love",
      sort: "price-desc",
    });
  });
});

describe("calculateItemPrice", () => {
  it("adds add-ons to the variant price", () => {
    expect(
      calculateItemPrice({
        variantPriceHalalas: 34900,
        addOnPricesHalalas: [5900],
      }),
    ).toBe(40800);
  });

  it("multiplies by quantity", () => {
    expect(
      calculateItemPrice({
        variantPriceHalalas: 10000,
        addOnPricesHalalas: [500, 500],
        quantity: 3,
      }),
    ).toBe(33000);
  });

  it("rejects fractional or negative amounts and bad quantities", () => {
    expect(() =>
      calculateItemPrice({ variantPriceHalalas: 99.5, addOnPricesHalalas: [] }),
    ).toThrow(RangeError);
    expect(() =>
      calculateItemPrice({
        variantPriceHalalas: 100,
        addOnPricesHalalas: [-1],
      }),
    ).toThrow(RangeError);
    expect(() =>
      calculateItemPrice({
        variantPriceHalalas: 100,
        addOnPricesHalalas: [],
        quantity: 0,
      }),
    ).toThrow(RangeError);
  });
});

describe("variantPrices (seed)", () => {
  it("derives large and luxury prices ending in 9 riyals", () => {
    expect(variantPrices(249)).toEqual({
      regular: 24900,
      large: 34900,
      luxury: 49900,
    });
    for (const price of Object.values(variantPrices(189)))
      expect((price / 100) % 10).toBe(9);
  });
});

describe("Riyadh date helpers", () => {
  // 21:30 UTC on 30 Sep is already 00:30 on 1 Oct in Riyadh.
  const lateUtc = new Date("2026-09-30T21:30:00Z");

  it("uses the Riyadh calendar date, not UTC", () => {
    expect(riyadhDateString(lateUtc)).toBe("2026-10-01");
    expect(riyadhHour(lateUtc)).toBe(0);
    expect(riyadhHour(new Date("2026-10-01T11:00:00Z"))).toBe(14);
  });

  it("adds days across month ends", () => {
    expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
  });

  it("returns ISO weekdays (Friday = 5, Saturday = 6)", () => {
    expect(isoWeekday("2026-10-02")).toBe(5);
    expect(isoWeekday("2026-10-03")).toBe(6);
    expect(isoWeekday("2026-10-04")).toBe(7);
  });

  it("formats the cut-off hour as shop copy", () => {
    expect(formatHour(14, "ar")).toBe("2 ظهرًا");
    expect(formatHour(14, "en")).toBe("2 PM");
    expect(formatHour(9, "ar")).toBe("9 صباحًا");
    expect(formatHour(19, "ar")).toBe("7 مساءً");
    expect(formatHour(12, "en")).toBe("12 PM");
  });
});

describe("alternatesFor", () => {
  it("builds canonical and ar-SA / en / x-default links", () => {
    expect(alternatesFor("en", "/catalog")).toEqual({
      canonical: `${SITE_URL}/en/catalog`,
      languages: {
        "ar-SA": `${SITE_URL}/ar/catalog`,
        en: `${SITE_URL}/en/catalog`,
        "x-default": `${SITE_URL}/ar/catalog`,
      },
    });
  });
});

describe("track", () => {
  afterEach(() => {
    setConsent("denied");
    vi.unstubAllGlobals();
  });

  it("sends nothing while consent is denied (the default)", () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal("window", { dispatchEvent });
    expect(getConsent()).toBe("denied");
    expect(
      track("view_item", {
        item_id: "x",
        item_name: "X",
        value: 1,
        currency: "SAR",
      }),
    ).toBe(false);
    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it("emits a local DOM event only once consent is granted", () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal("window", { dispatchEvent });
    vi.stubGlobal(
      "CustomEvent",
      class {
        constructor(
          public type: string,
          public init: unknown,
        ) {}
      },
    );
    setConsent("granted");
    expect(
      track("view_item", {
        item_id: "x",
        item_name: "X",
        value: 1,
        currency: "SAR",
      }),
    ).toBe(true);
    expect(dispatchEvent).toHaveBeenCalledOnce();
  });
});
