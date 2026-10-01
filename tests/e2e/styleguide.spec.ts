import { expect, test } from "@playwright/test";
import { projectLocale } from "./helpers";

const copy = {
  ar: {
    title: "دليل التصميم",
    openSheet: "افتح السلة",
    sheetTitle: "سلتك",
    flood: "حيّاك في قُرمُزي",
  },
  en: {
    title: "Style guide",
    openSheet: "Open cart",
    sheetTitle: "Your cart",
    flood: "Welcome to Qurmuzi",
  },
} as const;

test.describe("styleguide", () => {
  test("renders every section and saves a full-page screenshot", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/${locale}/styleguide`);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      copy[locale].title,
    );
    for (const id of [
      "colors",
      "contrast",
      "typography",
      "buttons",
      "forms",
      "overlays",
      "badges",
      "skeleton",
      "shop",
      "utils",
      "motion",
    ]) {
      await expect(
        page.locator(`section[aria-labelledby="${id}"]`),
      ).toBeVisible();
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    await testInfo.attach(`styleguide-${testInfo.project.name}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  });

  test("prices, dates and phones use Latin digits", async ({
    page,
  }, testInfo) => {
    await page.goto(`/${projectLocale(testInfo)}/styleguide`);
    const utils = page.locator('section[aria-labelledby="utils"]');
    await expect(utils).toContainText("349.50");
    await expect(utils).toContainText("+966 50 123 4567");
    await expect(utils).not.toContainText(/[٠-٩]/);
  });

  test("sheet opens from the inline-end side and closes with Escape", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}/styleguide`);
    await page.getByRole("button", { name: copy[locale].openSheet }).click();

    const sheet = page.getByRole("dialog", { name: copy[locale].sheetTitle });
    await expect(sheet).toBeVisible();
    const box = await sheet.boundingBox();
    const width = page.viewportSize()!.width;
    // "end" is the left edge in RTL and the right edge in LTR.
    if (locale === "ar") expect(box!.x).toBeLessThanOrEqual(1);
    else expect(box!.x + box!.width).toBeGreaterThanOrEqual(width - 1);

    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  });

  test("motion components end fully visible after scrolling", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}/styleguide`);
    const content = page.locator("[data-flood-content]");
    // Far from the viewport, GSAP is not loaded yet and the content is plainly visible.
    await expect(content).toHaveCSS("opacity", "1");
    // Just below the fold, GSAP loads and sets the start state: the animation is wired up.
    await content.evaluate((el) => {
      const section = el.closest("section")!;
      window.scrollTo(
        0,
        section.getBoundingClientRect().top +
          window.scrollY -
          window.innerHeight -
          50,
      );
    });
    await expect(content).toHaveCSS("opacity", "0");
    const flood = page.getByText(copy[locale].flood);
    await flood.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 600);
    await expect(flood).toBeVisible();
    await expect
      .poll(() =>
        flood.evaluate(
          (el) => getComputedStyle(el.closest("[data-flood-content]")!).opacity,
        ),
      )
      .toBe("1");
  });

  test("reduced motion shows content without animating", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/${locale}/styleguide`);
    // Nothing has scrolled yet, but the flood content is already visible.
    const content = page.locator("[data-flood-content]");
    await expect(content).toHaveCSS("opacity", "1");
    await expect(page.locator("[data-flood-layer]")).toHaveCSS(
      "transform",
      "none",
    );
  });
});
