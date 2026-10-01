import { expect, test } from "@playwright/test";
import { projectLocale } from "./helpers";

const copy = {
  ar: {
    cta: "اطلب الآن",
    promise: "اطلب قبل 2 ظهرًا ويوصل اليوم",
    occasions: "وش المناسبة؟",
    newBaby: "مواليد",
    under200: "أقل من 200 ر.س",
    featured: "اختياراتنا لك",
    flood: "كل بوكيه نجهّزه بيدنا",
  },
  en: {
    cta: "Order now",
    promise: "Order before 2 PM for same-day delivery",
    occasions: "What's the occasion?",
    newBaby: "New baby",
    under200: "Under SAR 200",
    featured: "Our picks for you",
    flood: "Every bouquet is made by hand",
  },
} as const;

test.describe("home", () => {
  test("hero shows the delivery promise and a CTA in the first screen", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}`);
    await expect(page.getByText(copy[locale].promise)).toBeInViewport();
    await expect(
      page.getByRole("link", { name: copy[locale].cta }),
    ).toBeInViewport();
  });

  test("hero image is a static, eagerly loaded, high-priority image in the HeroMedia slot", async ({
    page,
  }, testInfo) => {
    await page.goto(`/${projectLocale(testInfo)}`);
    const image = page.locator('[data-slot="hero-media"] img');
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("fetchpriority", "high");
    await expect(image).toHaveAttribute("loading", "eager");
    await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(
      1,
    );
  });

  test("reaches a product in two clicks: occasion → product", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}`);
    await expect(
      page.getByRole("heading", { name: copy[locale].occasions }),
    ).toBeAttached();

    await page
      .locator("#occasions")
      .getByRole("link", { name: new RegExp(copy[locale].newBaby) })
      .click();
    await expect(page).toHaveURL(/\/catalog\?occasion=new-baby$/);

    await page.locator("main ul.grid > li a").first().click();
    await expect(page).toHaveURL(/\/products\/baby-/);
  });

  test("budget shortcut opens the filtered catalog", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}`);
    await page.getByRole("link", { name: copy[locale].under200 }).click();
    await expect(page).toHaveURL(/\/catalog\?budget=under-200$/);
    await expect(page.locator("main ul.grid > li")).toHaveCount(3);
  });

  test("shows four featured products and the crimson flood section", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}`);
    const featured = page.getByRole("region", { name: copy[locale].featured });
    await expect(featured.getByRole("listitem")).toHaveCount(4);

    const flood = page.getByRole("heading", { name: copy[locale].flood });
    await flood.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 800);
    await expect
      .poll(() =>
        flood.evaluate(
          (el) => getComputedStyle(el.closest("[data-flood-content]")!).opacity,
        ),
      )
      .toBe("1");
  });

  test("header 'Occasions' link jumps to the occasions section", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}/catalog`);
    if (testInfo.project.name.startsWith("mobile")) {
      await page
        .getByRole("button", { name: locale === "ar" ? "القائمة" : "Menu" })
        .click();
      await page
        .getByRole("dialog")
        .getByRole("link", {
          name: locale === "ar" ? "المناسبات" : "Occasions",
        })
        .click();
    } else {
      await page
        .getByRole("banner")
        .getByRole("link", {
          name: locale === "ar" ? "المناسبات" : "Occasions",
        })
        .click();
    }
    await expect(page).toHaveURL(new RegExp(`/${locale}#occasions$`));
    await expect(page.locator("#occasions")).toBeInViewport();
  });

  test("has Organization JSON-LD", async ({ page }, testInfo) => {
    await page.goto(`/${projectLocale(testInfo)}`);
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(
      blocks
        .map((b) => JSON.parse(b) as { "@type": string })
        .some((d) => d["@type"] === "Organization"),
    ).toBe(true);
  });

  test("animation library is not in the initial scripts", async ({
    page,
    request,
  }, testInfo) => {
    // GSAP is lazy-loaded near the viewport, so it must not be in the page's <script> tags.
    const html = await (
      await request.get(`/${projectLocale(testInfo)}`)
    ).text();
    const sources = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(
      (match) => match[1],
    );
    expect(sources.length).toBeGreaterThan(0);
    for (const src of sources) {
      const body = await (await request.get(src)).text();
      // Signatures from the GSAP core and ScrollTrigger builds.
      expect(body, src).not.toContain("GreenSockGlobals");
      expect(body, src).not.toContain("scrollerProxy");
    }
    void page;
  });
});
