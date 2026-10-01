import { describe, expect, it } from "vitest";
import { localeDirection, routing } from "@/i18n/routing";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";

describe("i18n routing", () => {
  it("defaults to Arabic", () => {
    expect(routing.defaultLocale).toBe("ar");
  });

  it("gives every locale a text direction", () => {
    expect(localeDirection).toEqual({ ar: "rtl", en: "ltr" });
  });
});

describe("messages", () => {
  const keys = (obj: object, prefix = ""): string[] =>
    Object.entries(obj).flatMap(([key, value]) =>
      typeof value === "object" && value !== null
        ? keys(value as object, `${prefix}${key}.`)
        : [`${prefix}${key}`],
    );

  it("have the same keys in ar and en", () => {
    expect(keys(en).sort()).toEqual(keys(ar).sort());
  });
});
