import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BRAND_COLORS } from "@/lib/design-tokens";
import { isStyleguideEnabled } from "@/lib/styleguide";

describe("design tokens", () => {
  const css = readFileSync("src/app/globals.css", "utf8");

  it.each(Object.entries(BRAND_COLORS))(
    "--%s matches globals.css",
    (name, value) => {
      expect(css).toMatch(new RegExp(`--${name}:\\s*${value};`, "i"));
    },
  );
});

describe("isStyleguideEnabled", () => {
  it("is on in development", () => {
    expect(isStyleguideEnabled({ NODE_ENV: "development" })).toBe(true);
  });

  it("is off in production by default", () => {
    expect(isStyleguideEnabled({ NODE_ENV: "production" })).toBe(false);
  });

  it("can be turned on in a production build for CI", () => {
    expect(
      isStyleguideEnabled({ NODE_ENV: "production", ENABLE_STYLEGUIDE: "1" }),
    ).toBe(true);
  });
});
